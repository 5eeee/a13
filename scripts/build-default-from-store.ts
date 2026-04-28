/**
 * Собирает server/data/default-cms.json из тех же дефолтов, что и фронт (store + about).
 * Запуск из корня: npx vite-node scripts/build-default-from-store.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_PROJECTS,
  DEFAULT_BLOG,
  DEFAULT_STATS,
  DEFAULT_SETTINGS,
  DEFAULT_REVIEWS,
  DEFAULT_PARTNERS,
  DEFAULT_ABOUT_PAGE,
} from "../src/app/lib/store";
import { DEFAULT_ABOUT_STRUCTURED } from "../src/app/lib/aboutStructured";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const out = path.join(root, "server", "data", "default-cms.json");

const docs = {
  projects: DEFAULT_PROJECTS,
  blog: DEFAULT_BLOG,
  stats: DEFAULT_STATS,
  settings: DEFAULT_SETTINGS,
  reviews: DEFAULT_REVIEWS,
  partners: DEFAULT_PARTNERS,
  leads: [] as unknown[],
  serviceExamples: {} as Record<string, unknown>,
  aboutPage: {
    ...DEFAULT_ABOUT_PAGE,
    structured: DEFAULT_ABOUT_STRUCTURED,
  },
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(docs), "utf8");
console.log("Written:", out);
