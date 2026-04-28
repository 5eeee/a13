/**
 * Перенос данных из server/data/cms.json в PostgreSQL (таблица cms_documents).
 * Запуск из папки server:  npm run migrate:json
 * Требуется DATABASE_URL в server/.env. Существующие ключи в БД перезаписываются из JSON.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, "..");
dotenv.config({ path: path.join(serverRoot, ".env") });

const DATABASE_URL = (process.env.DATABASE_URL || "").trim();
const DATA_FILE = process.env.DATA_FILE || path.join(serverRoot, "data", "cms.json");

if (!DATABASE_URL) {
  console.error("Задайте DATABASE_URL в server/.env (PostgreSQL).");
  process.exit(1);
}

if (!fs.existsSync(DATA_FILE)) {
  console.log("Файл не найден:", DATA_FILE, "— нечего мигрировать.");
  process.exit(0);
}

let raw;
try {
  raw = fs.readFileSync(DATA_FILE, "utf8");
} catch (e) {
  console.error("Не удалось прочитать", DATA_FILE, e);
  process.exit(1);
}

let docs;
try {
  docs = JSON.parse(raw);
} catch (e) {
  console.error("Некорректный JSON в", DATA_FILE, e);
  process.exit(1);
}

if (!docs || typeof docs !== "object" || Array.isArray(docs)) {
  console.error("Ожидался объект с ключами документов (projects, settings, …)");
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

const keys = Object.keys(docs);
if (keys.length === 0) {
  console.log("JSON пуст — нечего мигрировать.");
  await pool.end();
  process.exit(0);
}

const client = await pool.connect();
try {
  await client.query("BEGIN");
  for (const key of keys) {
    const data = docs[key];
    await client.query(
      `INSERT INTO cms_documents (key, data, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [key, JSON.stringify(data === undefined ? null : data)]
    );
  }
  await client.query("COMMIT");
  console.log("Миграция завершена:", keys.length, "ключей → PostgreSQL.");
  console.log("Ключи:", keys.sort().join(", "));
} catch (e) {
  await client.query("ROLLBACK");
  console.error(e);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
