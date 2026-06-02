#!/usr/bin/env node
/** Убирает устаревший префикс /a13/ в URL картинок в CMS (PostgreSQL или cms.json). */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;
const DATABASE_URL = (process.env.DATABASE_URL || "").trim();
const DATA_FILE = process.env.DATA_FILE || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "cms.json");

function fixValue(v) {
  if (typeof v === "string") return v.replace(/\/a13\//g, "/");
  if (Array.isArray(v)) return v.map(fixValue);
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, val] of Object.entries(v)) o[k] = fixValue(val);
    return o;
  }
  return v;
}

async function main() {
  if (DATABASE_URL) {
    const pool = new Pool({ connectionString: DATABASE_URL });
    const { rows } = await pool.query("SELECT key, data FROM cms_documents");
    let n = 0;
    for (const row of rows) {
      const fixed = fixValue(row.data);
      if (JSON.stringify(fixed) !== JSON.stringify(row.data)) {
        await pool.query(
          `UPDATE cms_documents SET data = $1::jsonb, updated_at = now() WHERE key = $2`,
          [JSON.stringify(fixed), row.key]
        );
        n++;
        console.log("updated", row.key);
      }
    }
    await pool.end();
    console.log("PostgreSQL: keys updated:", n);
    return;
  }
  if (!fs.existsSync(DATA_FILE)) {
    console.log("No DATABASE_URL and no", DATA_FILE);
    return;
  }
  const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  const fixed = fixValue(raw);
  fs.writeFileSync(DATA_FILE, JSON.stringify(fixed));
  console.log("Written", DATA_FILE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
