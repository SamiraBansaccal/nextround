import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { readFileSync, writeFileSync } from "node:fs";
const input = readFileSync("app/globals.css", "utf8") + "\n@source \"../components\";\n@source \"../app\";\n";
const out = await postcss([tailwind({ base: process.cwd() })]).process(input, { from: "app/globals.css" });
writeFileSync(".preview/out.css", out.css);
console.log("css", out.css.length);
