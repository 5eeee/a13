import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { forwardLeadNotifications } from "./leadNotify.js";
import { authenticator } from "otplib";

const { Pool } = pg;
const PORT = Number(process.env.PORT) || 3001;
const DATABASE_URL = (process.env.DATABASE_URL || "").trim();
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = process.env.DATA_FILE || path.join(DATA_DIR, "cms.json");

/** Режим без Docker: STORAGE=file или пустой DATABASE_URL */
const USE_FILE = process.env.STORAGE === "file" || !DATABASE_URL;

const LEAD_RATE_WINDOW_MS = Number(process.env.LEAD_RATE_WINDOW_MS) || 60_000;
const LEAD_RATE_MAX = Number(process.env.LEAD_RATE_MAX) || 20;

function requireAdmin(req, res, next) {
  if (!ADMIN_API_KEY) return next();
  const k = req.headers["x-admin-key"];
  if (k !== ADMIN_API_KEY) return res.status(403).json({ error: "Forbidden" });
  next();
}

/* ---- TOTP: проверка кода (брут сдерживаем) ---- */
const TOTP_WINDOW_MS = Number(process.env.TOTP_RATE_WINDOW_MS) || 60_000;
const TOTP_MAX = Number(process.env.TOTP_RATE_MAX) || 12;
const totpRateBucket = new Map();
function totpRateLimit(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  let b = totpRateBucket.get(ip);
  if (!b || now > b.reset) {
    b = { n: 0, reset: now + TOTP_WINDOW_MS };
    totpRateBucket.set(ip, b);
  }
  if (b.n >= TOTP_MAX) {
    return res.status(429).json({ error: "Слишком много попыток. Подождите минуту." });
  }
  b.n += 1;
  next();
}

/* ---- Rate limit (заявки) ---- */
const rateBucket = new Map();
function leadRateLimit(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  let b = rateBucket.get(ip);
  if (!b || now > b.reset) {
    b = { n: 0, reset: now + LEAD_RATE_WINDOW_MS };
    rateBucket.set(ip, b);
  }
  if (b.n >= LEAD_RATE_MAX) {
    console.warn("[leads] 429 rate limit", ip);
    return res.status(429).json({ error: "Слишком много заявок. Попробуйте позже." });
  }
  b.n += 1;
  next();
}

/* ---- Валидация заявки ---- */
function validateLeadBody(raw) {
  if (!raw || typeof raw !== "object") throw new Error("Validation");
  const name = String(raw.name ?? "").trim().slice(0, 200);
  const phone = String(raw.phone ?? "").trim().slice(0, 80);
  const email = String(raw.email ?? "").trim().slice(0, 120);
  const message = String(raw.message ?? "").trim().slice(0, 8000);
  const source = String(raw.source ?? "Сайт").trim().slice(0, 160);
  const calculation = raw.calculation != null ? String(raw.calculation).slice(0, 50_000) : "";
  const region = raw.region != null ? String(raw.region).trim().slice(0, 200) : "";
  const floors = raw.floors != null ? String(raw.floors).trim().slice(0, 120) : "";
  let files = Array.isArray(raw.files) ? raw.files.map(String).slice(0, 30) : [];
  files = files.map((f) => f.slice(0, 1_200_000));
  const filesTotal = files.reduce((a, f) => a + f.length, 0);
  if (filesTotal > 6 * 1024 * 1024) throw new Error("Validation");
  if (!name || !phone) throw new Error("Validation");
  return { name, phone, email, message, calculation, source, region, floors, files };
}

/* ---- Файловое хранилище (JSON) ---- */
function readFileStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeFileStore(documents) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(documents, null, 0), "utf8");
}

/* ---- PostgreSQL ---- */
let pool = null;
async function initPg() {
  pool = new Pool({ connectionString: DATABASE_URL });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cms_documents (
      key TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

async function getAllDocuments() {
  if (USE_FILE) return readFileStore();
  const { rows } = await pool.query("SELECT key, data FROM cms_documents");
  const out = {};
  for (const r of rows) out[r.key] = r.data;
  return out;
}

async function putDocument(key, data) {
  if (USE_FILE) {
    const all = readFileStore();
    all[key] = data;
    writeFileStore(all);
    return;
  }
  await pool.query(
    `INSERT INTO cms_documents (key, data, updated_at) VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [key, JSON.stringify(data === undefined ? null : data)]
  );
}

async function appendLead(body) {
  if (USE_FILE) {
    const all = readFileStore();
    let leads = all.leads;
    if (!Array.isArray(leads)) leads = [];
    const maxId = leads.reduce((m, l) => Math.max(m, Number(l.id) || 0), 0);
    const newLead = { ...body, id: maxId + 1 };
    if (!newLead.date) newLead.date = new Date().toISOString();
    all.leads = [...leads, newLead];
    writeFileStore(all);
    return newLead;
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT data FROM cms_documents WHERE key = 'leads' FOR UPDATE");
    let leads = rows[0]?.data;
    if (!Array.isArray(leads)) leads = [];
    const maxId = leads.reduce((m, l) => Math.max(m, Number(l.id) || 0), 0);
    const newLead = { ...body, id: maxId + 1 };
    if (!newLead.date) newLead.date = new Date().toISOString();
    leads = [...leads, newLead];
    await client.query(
      `INSERT INTO cms_documents (key, data, updated_at) VALUES ('leads', $1::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [JSON.stringify(leads)]
    );
    await client.query("COMMIT");
    return newLead;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/* ---- HTTP ---- */
const app = express();

const corsOpts = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean) }
  : {};
app.use(cors(corsOpts));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, storage: USE_FILE ? "file" : "postgres" });
});

/** Заявки: до 512 КБ, отдельный лимит от тяжёлого JSON админки */
app.post("/api/leads", express.json({ limit: "20mb" }), leadRateLimit, async (req, res) => {
  try {
    const body = validateLeadBody(req.body);
    body.date = new Date().toISOString();
    const newLead = await appendLead(body);
    const docs = await getAllDocuments();
    const settings = docs.settings && typeof docs.settings === "object" ? docs.settings : {};
    setImmediate(() => {
      forwardLeadNotifications(newLead, settings).catch((e) => console.error("[leads/notify]", e));
    });
    console.log("[leads] saved id", newLead.id, "source", newLead.source);
    res.json(newLead);
  } catch (e) {
    if (e?.message === "Validation") {
      console.warn("[leads] 400 validation", req.ip);
      return res.status(400).json({ error: "Некорректные данные заявки" });
    }
    console.error("[leads]", e);
    res.status(500).json({ error: String(e.message) });
  }
});

app.use(express.json({ limit: "50mb" }));

app.post("/api/auth/verify-totp", totpRateLimit, async (req, res) => {
  try {
    const code = String(req.body?.code ?? "")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (code.length !== 6) return res.status(400).json({ error: "Invalid code" });
    const all = await getAllDocuments();
    const s = all.settings && typeof all.settings === "object" ? all.settings : {};
    if (!s.totpEnabled || !s.totpSecret) return res.status(403).json({ error: "2FA not configured" });
    const ok = authenticator.check(code, s.totpSecret);
    if (!ok) return res.status(401).json({ error: "Invalid code" });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/** Настройка 2FA: секрет (только с админ-ключом, как остальные CMS-операции). */
app.post("/api/admin/totp-provision", requireAdmin, (req, res) => {
  try {
    const secret = authenticator.generateSecret();
    const keyuri = authenticator.keyuri("admin", "A13 Бюро", secret);
    return res.json({ secret, keyuri });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

/** Проверка 6-знаков с только что выданным секретом (перед сохранением в настройки). */
app.post("/api/admin/verify-totp-pair", requireAdmin, (req, res) => {
  try {
    const secret = String(req.body?.secret ?? "");
    const code = String(req.body?.code ?? "")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (code.length !== 6 || !secret) return res.status(400).json({ ok: false, error: "Invalid" });
    if (!authenticator.check(code, secret)) return res.status(400).json({ ok: false, error: "Invalid code" });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

const SENSITIVE_SETTINGS = ["telegramBotToken", "telegramChatId", "emailServiceId", "totpSecret"];

function stripSensitiveSettingsInDocs(docs) {
  if (!docs?.settings || typeof docs.settings !== "object") return docs;
  const settings = { ...docs.settings };
  for (const k of SENSITIVE_SETTINGS) delete settings[k];
  return { ...docs, settings };
}

app.get("/api/documents", async (_req, res) => {
  try {
    const all = await getAllDocuments();
    res.json(stripSensitiveSettingsInDocs(all));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message) });
  }
});

app.get("/api/documents/:key", async (req, res) => {
  try {
    const all = await getAllDocuments();
    if (!(req.params.key in all)) return res.status(404).json({ error: "Not found" });
    if (req.params.key === "settings") {
      const s = stripSensitiveSettingsInDocs({ settings: all.settings && typeof all.settings === "object" ? all.settings : {} }).settings;
      return res.json(s ?? {});
    }
    res.json(all[req.params.key]);
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

app.put("/api/documents/:key", requireAdmin, async (req, res) => {
  try {
    let body = req.body;
    if (req.params.key === "settings" && body && typeof body === "object") {
      const all = await getAllDocuments();
      const prev = all.settings && typeof all.settings === "object" ? all.settings : {};
      body = { ...body };
      if (body.totpEnabled === false) {
        body.totpSecret = "";
      }
      for (const k of SENSITIVE_SETTINGS) {
        if (k === "totpSecret" && body.totpEnabled === false) {
          body.totpSecret = "";
          continue;
        }
        const v = body[k];
        if (v == null || v === "") {
          if (prev[k] != null && prev[k] !== "") body[k] = prev[k];
          else delete body[k];
        }
      }
    }
    await putDocument(req.params.key, body);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message) });
  }
});

if (USE_FILE) {
  console.log(`A13 API file storage → ${DATA_FILE}`);
} else {
  await initPg();
  console.log("A13 API PostgreSQL");
}
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
