#!/usr/bin/env node
/**
 * Оставляет в public/projects только файлы, на которые есть ссылки в CMS.
 * Сжимает WebP (quality 82). Источник CMS: API или server/data/cms.json.
 *
 *   node scripts/prune-project-images.mjs --dry-run
 *   node scripts/prune-project-images.mjs
 *   CMS_URL=http://127.0.0.1:3001 node scripts/prune-project-images.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PROJECTS = path.join(ROOT, "public", "projects");
const dryRun = process.argv.includes("--dry-run");
const cmsUrl = (process.env.CMS_URL || "").replace(/\/$/, "");

function collectUrls(obj, out = new Set()) {
  if (obj == null) return out;
  if (typeof obj === "string") {
    const m = obj.match(/(?:\/a13)?\/projects\/[\w./-]+\.(webp|png|jpe?g|svg)/gi);
    if (m) m.forEach((u) => out.add(u.replace(/^\/a13/, "")));
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((x) => collectUrls(x, out));
    return out;
  }
  if (typeof obj === "object") {
    Object.values(obj).forEach((v) => collectUrls(v, out));
  }
  return out;
}

async function loadCms() {
  if (cmsUrl) {
    const r = await fetch(`${cmsUrl}/api/documents`);
    if (!r.ok) throw new Error(`CMS API ${r.status}`);
    return r.json();
  }
  const jsonPath = path.join(ROOT, "server", "data", "cms.json");
  const defPath = path.join(ROOT, "server", "data", "default-cms.json");
  try {
    return JSON.parse(await fs.readFile(jsonPath, "utf8"));
  } catch {
    return JSON.parse(await fs.readFile(defPath, "utf8"));
  }
}

function urlToRelative(url) {
  const u = url.replace(/^\/a13/, "").replace(/^\//, "");
  return u.startsWith("projects/") ? u.slice("projects/".length) : u;
}

async function walkFiles(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walkFiles(full, base)));
    else if (/\.(webp|png|jpe?g)$/i.test(e.name)) {
      files.push(path.relative(base, full).replace(/\\/g, "/"));
    }
  }
  return files;
}

async function main() {
  const cms = await loadCms();
  const usedUrls = collectUrls(cms);
  const usedRel = new Set();
  for (const u of usedUrls) usedRel.add(urlToRelative(u));

  // Всегда оставляем web/01..18 (дефолтная галерея) если в БД пути с /a13/
  for (let i = 1; i <= 18; i++) {
    const n = String(i).padStart(2, "0");
    for (const s of ["a", "b", "c"]) usedRel.add(`web/${n}-${s}.webp`);
  }

  const allFiles = await walkFiles(PROJECTS);
  let deleted = 0;
  let compressed = 0;
  let savedBytes = 0;

  for (const rel of allFiles) {
    if (rel === "README.txt" || rel.endsWith("manifest.json") || rel.endsWith("ATTRIBUTION.txt")) continue;
    if (!usedRel.has(rel)) {
      const full = path.join(PROJECTS, rel);
      if (!dryRun) await fs.unlink(full).catch(() => {});
      deleted++;
      console.log(dryRun ? "[dry] delete" : "delete", rel);
    }
  }

  for (const rel of [...usedRel]) {
    const full = path.join(PROJECTS, rel);
    try {
      const before = (await fs.stat(full)).size;
      if (dryRun) continue;
      const buf = await sharp(full).webp({ quality: 82, effort: 4 }).toBuffer();
      if (buf.length < before) {
        await fs.writeFile(full, buf);
        savedBytes += before - buf.length;
        compressed++;
      }
    } catch {
      /* файла нет на диске */
    }
  }

  console.log("\nUsed paths:", usedRel.size);
  console.log("Deleted unused:", deleted);
  console.log("Compressed:", compressed, `saved ~${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
  if (dryRun) console.log("(dry-run — файлы не менялись)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
