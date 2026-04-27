/**
 * Конвертирует public/projects/pptx-*.png в WebP (меньший вес при сопоставимом качестве).
 * Запуск: node scripts/optimize-public-images.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public", "projects");

const files = (await fs.readdir(DIR)).filter((f) => /^pptx-\d+\.png$/i.test(f));
if (files.length === 0) {
  console.warn("Нет pptx-*.png в", DIR);
  process.exit(0);
}

let saved = 0;
for (const f of files.sort()) {
  const src = path.join(DIR, f);
  const dest = path.join(DIR, f.replace(/\.png$/i, ".webp"));
  const inBuf = await fs.readFile(src);
  await sharp(inBuf)
    .webp({ quality: 82, effort: 5, smartSubsample: true })
    .toFile(dest);
  const before = inBuf.length;
  const after = (await fs.stat(dest)).size;
  saved += before - after;
  await fs.unlink(src);
  console.log(`${f} → ${path.basename(dest)} (${(before / 1024).toFixed(0)} → ${(after / 1024).toFixed(0)} KiB)`);
}
console.log(`Готово. Суммарно меньше на ~${(saved / 1024 / 1024).toFixed(2)} MiB (PNG удалены).`);
