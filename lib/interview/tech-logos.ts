import {
  siAnsible, siArduino, siC, siCplusplus, siDocker, siDotnet, siGit, siGithubactions, siGnubash, siGo, siGrafana, siHtml5, siJavascript, siKubernetes,
  siLinux, siMongodb, siNextdotjs, siNginx, siNodedotjs, siOdoo, siOpenjdk, siPhp, siPostgresql, siPython, siReact, siRedis, siRust, siSpringboot,
  siTerraform, siTypescript, siVuedotjs, siAngular,
} from "simple-icons";

// The logo of each technology of the question bank, as an SVG path and its brand colour (Simple Icons,
// CC0). Server-side data: components receive the path as a prop. Technologies without a logo (notions
// such as concurrency or security) get a generic icon key the UI maps to an icon.

export type TechLogo = { kind: "brand"; path: string; hex: string } | { kind: "icon"; icon: string };

const brand = (icon: { path: string; hex: string }): TechLogo => ({ kind: "brand", path: icon.path, hex: icon.hex });

const LOGOS: Record<string, TechLogo> = {
  docker: brand(siDocker),
  kubernetes: brand(siKubernetes),
  cicd: brand(siGithubactions),
  git: brand(siGit),
  linux: brand(siLinux),
  bash: brand(siGnubash),
  terraform: brand(siTerraform),
  ansible: brand(siAnsible),
  cloud: { kind: "icon", icon: "cloud" },
  networking: { kind: "icon", icon: "network" },
  nginx: brand(siNginx),
  monitoring: brand(siGrafana),
  javascript: brand(siJavascript),
  typescript: brand(siTypescript),
  react: brand(siReact),
  node: brand(siNodedotjs),
  nextjs: brand(siNextdotjs),
  angular: brand(siAngular),
  vue: brand(siVuedotjs),
  "html-css": brand(siHtml5),
  rest: { kind: "icon", icon: "plug" },
  php: brand(siPhp),
  odoo: brand(siOdoo),
  java: brand(siOpenjdk),
  spring: brand(siSpringboot),
  c: brand(siC),
  cpp: brand(siCplusplus),
  posix: brand(siLinux),
  concurrency: { kind: "icon", icon: "cpu" },
  embedded: brand(siArduino),
  python: brand(siPython),
  csharp: brand(siDotnet),
  go: brand(siGo),
  rust: brand(siRust),
  sql: brand(siPostgresql),
  nosql: brand(siMongodb),
  redis: brand(siRedis),
  algorithms: { kind: "icon", icon: "binary" },
  oop: { kind: "icon", icon: "boxes" },
  security: { kind: "icon", icon: "shield" },
  testing: { kind: "icon", icon: "flask" },
  agile: { kind: "icon", icon: "kanban" },
  architecture: { kind: "icon", icon: "layers" },
  llm: { kind: "icon", icon: "sparkles" },
  windows: { kind: "icon", icon: "monitor" },
};

export function techLogo(id: string): TechLogo {
  return LOGOS[id] ?? { kind: "icon", icon: "code" };
}
