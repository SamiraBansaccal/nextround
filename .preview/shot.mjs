import { chromium } from "playwright";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const root = process.cwd();
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet"><style>:root{--font-lora:'Lora';--font-nunito:'Nunito Sans'}</style><link rel="stylesheet" href="/out.css"></head><body class="bg-background font-sans text-foreground"><div id="root"></div><script type="module" src="/app.js"></script></body></html>`;
const srv = http.createServer((q, r) => {
  const u = new URL(q.url, "http://x");
  if (u.pathname === "/") { r.setHeader("content-type", "text/html"); return r.end(html); }
  const f = u.pathname.startsWith("/out.css") || u.pathname === "/app.js" ? path.join(root, ".preview", u.pathname) : path.join(root, "public", u.pathname);
  if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); }
  r.setHeader("content-type", f.endsWith(".css") ? "text/css" : f.endsWith(".js") ? "text/javascript" : f.endsWith(".webp") ? "image/webp" : "application/octet-stream");
  r.end(fs.readFileSync(f));
}).listen(8766);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: [`--proxy-server=${process.env.HTTPS_PROXY ?? ""}`, "--proxy-bypass-list=localhost;127.0.0.1", "--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
const p = await ctx.newPage();
p.on("pageerror", (e) => console.log("pageerror", e.message));
for (const [name, query, action] of JSON.parse(process.argv[2])) {
  await p.goto(`http://localhost:8766/?${query}`);
  await p.waitForSelector("#root *", { timeout: 15000 });
  await p.waitForTimeout(1200);
  if (action === "continue") { await p.getByRole("button", { name: /Continue to the call check/ }).click(); await p.waitForTimeout(1500); }
  await p.screenshot({ path: `.preview/${name}.png`, fullPage: true });
  console.log("shot", name);
}
await b.close(); srv.close();
