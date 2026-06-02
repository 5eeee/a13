#!/usr/bin/env node
/**
 * Одноразовый деплой по SSH (пароль из env SSH_PASS).
 * node scripts/ssh-deploy.mjs
 */
import { Client } from "ssh2";
import { createReadStream, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const HOST = process.env.SSH_HOST || "89.111.133.165";
const USER = process.env.SSH_USER || "root";
const PASS = process.env.SSH_PASS || "";
const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REMOTE = "/var/www/a13bureau";

const SKIP = new Set([
  "node_modules",
  "dist",
  ".git",
  ".env",
  ".env.local",
  "server/.env",
  "server/node_modules",
  "server/data/cms.json",
]);

function walk(dir, base = dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(base, full).replace(/\\/g, "/");
    if (SKIP.has(rel) || [...SKIP].some((s) => rel === s || rel.startsWith(s + "/"))) continue;
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, base));
    else out.push({ local: full, remote: `${REMOTE}/${rel}` });
  }
  return out;
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = "";
      let errOut = "";
      stream.on("data", (d) => { out += d; process.stdout.write(d); });
      stream.stderr.on("data", (d) => { errOut += d; process.stderr.write(d); });
      stream.on("close", (code) => {
        if (code !== 0) reject(new Error(`exit ${code}: ${errOut || out}`));
        else resolve(out);
      });
    });
  });
}

function sftpMkdir(sftp, dir) {
  return new Promise((resolve, reject) => {
    sftp.mkdir(dir, (err) => {
      if (!err || err.code === 4) return resolve();
      reject(err);
    });
  });
}

async function uploadFile(sftp, local, remote) {
  const parts = remote.split("/").slice(0, -1);
  let cur = "";
  for (const p of parts) {
    if (!p) continue;
    cur += "/" + p;
    await sftpMkdir(sftp, cur).catch(() => {});
  }
  return new Promise((resolve, reject) => {
    const rs = createReadStream(local);
    const ws = sftp.createWriteStream(remote);
    ws.on("close", resolve);
    ws.on("error", reject);
    rs.on("error", reject);
    rs.pipe(ws);
  });
}

async function main() {
  if (!PASS) {
    console.error("SSH_PASS required");
    process.exit(1);
  }

  const files = walk(ROOT);
  console.log(`Upload ${files.length} files to ${REMOTE}...`);

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn
      .on("ready", resolve)
      .on("error", reject)
      .connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 30000 });
  });

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => (err ? reject(err) : resolve(s)));
  });

  await exec(conn, `mkdir -p ${REMOTE}`);
  let n = 0;
  for (const f of files) {
    n++;
    if (n % 50 === 0) console.log(`  ${n}/${files.length}...`);
    await uploadFile(sftp, f.local, f.remote);
  }
  console.log("Upload done.");

  const deployCmd = `
set -e
cd ${REMOTE}
sed -i 's/\\r$//' deploy.sh 2>/dev/null || true
chmod +x deploy.sh
if [ -f deploy.sh ]; then
  ./deploy.sh update
else
  npm install && npm install --prefix server
  npx vite build
  pm2 delete buro-api 2>/dev/null || true
  pm2 start infra/pm2/ecosystem.config.json || pm2 start server/src/index.js --name buro-api --cwd ${REMOTE}/server
  pm2 save
fi
pm2 status
curl -s http://127.0.0.1:3001/api/health || true
ls -la dist/index.html 2>/dev/null || echo NO_DIST
nginx -t 2>&1 | tail -3
`;

  console.log("\n=== Deploy on server ===\n");
  await exec(conn, deployCmd);
  conn.end();
  console.log("\nDone. Check https://a13bureau.ru/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
