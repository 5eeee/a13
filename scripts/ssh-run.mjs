import { Client } from "ssh2";
const cmd = process.argv.slice(2).join(" ") || "echo ok";
const conn = new Client();
conn
  .on("ready", () => {
    conn.exec(cmd, (err, s) => {
      if (err) throw err;
      s.on("data", (d) => process.stdout.write(d));
      s.stderr.on("data", (d) => process.stderr.write(d));
      s.on("close", (c) => {
        conn.end();
        process.exit(c || 0);
      });
    });
  })
  .connect({
    host: process.env.SSH_HOST || "89.111.133.165",
    username: "root",
    password: process.env.SSH_PASS || "",
  });
