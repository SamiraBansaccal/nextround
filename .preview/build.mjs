import fs from "node:fs";
import { build } from "esbuild";
import path from "node:path";
const root = process.cwd();
const stub = (f) => path.join(root, ".preview/stubs", f);
const map = {
  "@/lib/auth": stub("auth.ts"), "@/lib/data/offers": stub("offers.ts"), "@/lib/data/interviews": stub("interviews.ts"),
  "../actions": stub("actions.ts"), "./actions": stub("actions.ts"), "next/link": stub("next-link.tsx"), "next/image": stub("next-image.tsx"),
  "next/navigation": stub("next-navigation.ts"), "server-only": stub("empty.ts"), "@clerk/nextjs": stub("clerk.tsx"), "@/lib/i18n/server": stub("i18n.ts"),
};
await build({
  entryPoints: [".preview/entry.tsx"], bundle: true, outfile: ".preview/app.js", format: "esm", jsx: "automatic", target: "es2022",
  define: { "process.env.NODE_ENV": '"production"' }, logLevel: "warning",
  plugins: [{ name: "stubs", setup(b) {
    b.onResolve({ filter: /.*/ }, (a) => (map[a.path] ? { path: map[a.path] } : a.path.startsWith("@/") ? { path: require_resolve(a.path) } : undefined));
  } }],
});
function require_resolve(p) {
  const base = path.join(root, p.slice(2));
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) { try { if (fs.statSync(base + ext).isFile()) return base + ext; } catch {} }
  return base;
}
