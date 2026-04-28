/**
 * Создаёт таблицу, заливает PostgreSQL: сначала server/data/cms.json (если есть),
 * недостающие ключи — из server/data/default-cms.json (как на сайте по умолчанию).
 * Запуск: npm run init:pg --prefix server  (из корня: npm run init:pg)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, "..");
dotenv.config({ path: path.join(serverRoot, ".env") });

const DATABASE_URL = (process.env.DATABASE_URL || "").trim();
const CMS_JSON = process.env.DATA_FILE || path.join(serverRoot, "data", "cms.json");
const DEFAULT_JSON = path.join(serverRoot, "data", "default-cms.json");

const DOC_KEYS = [
  "projects",
  "blog",
  "stats",
  "settings",
  "reviews",
  "partners",
  "leads",
  "serviceExamples",
  "aboutPage",
];

if (!DATABASE_URL) {
  console.error("Задайте DATABASE_URL в server/.env");
  process.exit(1);
}

if (!fs.existsSync(DEFAULT_JSON)) {
  console.error("Нет файла", DEFAULT_JSON, "— из корня: npm run build:default-cms");
  process.exit(1);
}

let fromFile = {};
if (fs.existsSync(CMS_JSON)) {
  try {
    fromFile = JSON.parse(fs.readFileSync(CMS_JSON, "utf8"));
    if (!fromFile || typeof fromFile !== "object" || Array.isArray(fromFile)) fromFile = {};
  } catch (e) {
    console.error("Ошибка чтения", CMS_JSON, e);
    process.exit(1);
  }
}

let defaults = {};
try {
  defaults = JSON.parse(fs.readFileSync(DEFAULT_JSON, "utf8"));
} catch (e) {
  console.error("Ошибка чтения", DEFAULT_JSON, e);
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

await pool.query(`
  CREATE TABLE IF NOT EXISTS cms_documents (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
  );
`);

const client = await pool.connect();
try {
  await client.query("BEGIN");
  for (const key of DOC_KEYS) {
    const v = fromFile[key] !== undefined ? fromFile[key] : defaults[key];
    if (v === undefined) continue;
    await client.query(
      `INSERT INTO cms_documents (key, data, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [key, JSON.stringify(v)]
    );
  }
  await client.query("COMMIT");
  console.log("PostgreSQL: записано ключей:", DOC_KEYS.filter((k) => fromFile[k] !== undefined || defaults[k] !== undefined).length);
  if (Object.keys(fromFile).length) {
    console.log("Учтены данные из", CMS_JSON, "+ недостающее из default-cms.json");
  } else {
    console.log("Использован только шаблон default-cms.json (cms.json не найден)");
  }
} catch (e) {
  await client.query("ROLLBACK");
  console.error(e);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
