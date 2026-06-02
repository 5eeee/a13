#!/usr/bin/env node
/**
 * Smoke / нагрузочные проверки продакшена.
 *   node scripts/test-production.mjs
 *   BASE_URL=https://a13bureau.ru node scripts/test-production.mjs
 */
const BASE = (process.env.BASE_URL || "https://a13bureau.ru").replace(/\/$/, "");
const results = [];
let failed = 0;

function ok(name, detail = "") {
  results.push({ name, pass: true, detail });
  console.log(`  OK  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail = "") {
  results.push({ name, pass: false, detail });
  failed++;
  console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
}

async function get(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeout ?? 15000);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(t);
    return r;
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

async function testPages() {
  const pages = [
    "/",
    "/about",
    "/services",
    "/gallery",
    "/calculator",
    "/blog",
    "/faq",
    "/contacts",
    "/clients",
    "/audience",
    "/vacancies",
    "/privacy",
    "/admin",
  ];
  for (const p of pages) {
    try {
      const r = await get(p);
      const html = await r.text();
      if (r.status === 200 && html.includes('id="root"')) ok(`page ${p}`);
      else fail(`page ${p}`, `status ${r.status}`);
    } catch (e) {
      fail(`page ${p}`, String(e.message || e));
    }
  }
}

async function testApi() {
  try {
    const r = await get("/api/health");
    const j = await r.json();
    if (j.ok) ok("API /api/health", j.storage || "");
    else fail("API /api/health", JSON.stringify(j));
  } catch (e) {
    fail("API /api/health", String(e.message || e));
  }

  try {
    const r = await get("/api/documents");
    const d = await r.json();
    if (r.ok && d.projects?.length) ok("API /api/documents", `${d.projects.length} projects`);
    else fail("API /api/documents");
  } catch (e) {
    fail("API /api/documents", String(e.message || e));
  }
}

async function testAssets() {
  const fixed = ["/logo.svg", "/projects/web/01-a.webp"];
  for (const p of fixed) {
    try {
      const r = await get(p, { method: "HEAD" });
      if (r.status === 200) ok(`asset ${p}`);
      else fail(`asset ${p}`, `status ${r.status}`);
    } catch (e) {
      fail(`asset ${p}`, String(e.message || e));
    }
  }
  try {
    const r = await get("/");
    const html = await r.text();
    const m = html.match(/href="(\/assets\/[^"]+\.css)"/);
    if (m) {
      const r2 = await get(m[1], { method: "HEAD" });
      if (r2.status === 200) ok("asset bundle css");
      else fail("asset bundle css", `status ${r2.status}`);
    } else fail("asset bundle css", "not found in index.html");
  } catch (e) {
    fail("asset bundle css", String(e.message || e));
  }
}

async function testLead() {
  const body = {
    name: "Тест автоматический",
    phone: "+7 (999) 000-00-01",
    email: "test@example.com",
    message: `Проверка ${new Date().toISOString()} — можно удалить в админке`,
    source: "production-test",
  };
  try {
    const r = await get("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const t = await r.text();
    if (r.status === 200 || r.status === 201) ok("POST /api/leads", t.slice(0, 80));
    else fail("POST /api/leads", `${r.status} ${t.slice(0, 120)}`);
  } catch (e) {
    fail("POST /api/leads", String(e.message || e));
  }
}

async function testMap() {
  const mapUrl =
    "https://yandex.ru/map-widget/v1/?ll=37.4167%2C55.7300&z=10&pt=37.3945%2C55.7264%2Cpm2blm~38.0456%2C55.9608%2Cpm2gnm";
  try {
    const r = await fetch(mapUrl, { method: "HEAD" });
    if (r.status < 400) ok("Yandex map widget");
    else fail("Yandex map widget", `status ${r.status}`);
  } catch (e) {
    fail("Yandex map widget", String(e.message || e));
  }
}

async function testLoad() {
  const n = 30;
  const path = "/";
  const start = Date.now();
  const rs = await Promise.all(
    Array.from({ length: n }, () => get(path).then((r) => r.status).catch(() => 0))
  );
  const ms = Date.now() - start;
  const okCount = rs.filter((s) => s === 200).length;
  if (okCount >= n * 0.9) ok(`load ${n}× GET /`, `${okCount}/${n} in ${ms}ms`);
  else fail(`load ${n}× GET /`, `${okCount}/${n} in ${ms}ms`);
}

async function main() {
  console.log(`\n=== Production tests: ${BASE} ===\n`);
  await testPages();
  await testApi();
  await testAssets();
  await testLead();
  await testMap();
  await testLoad();
  console.log(`\n=== ${results.length - failed} passed, ${failed} failed ===\n`);
  process.exit(failed ? 1 : 0);
}

main();
