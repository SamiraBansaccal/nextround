import { agile, algorithms, architecture, llm, oop, security, testing } from "./foundations";
import { ansible, bash, cicd, cloud, docker, git, kubernetes, linux, monitoring, networking, nginx, terraform, windows } from "./devops";
import { java, spring } from "./jvm";
import { csharp, go, odoo, python, rust } from "./languages";
import { nosql, redis, sql } from "./data";
import { c, concurrency, cpp, embedded, posix } from "./systems";
import type { TechEntry } from "./types";
import { angular, htmlCss, javascript, nextjs, node, php, react, rest, typescript, vue } from "./web";

// Every technology of the bank, in the order they are listed and matched. Adding one = one block in
// its family file, then one name here.

export const TECH_ENTRIES: readonly TechEntry[] = [
  c, cpp, posix, concurrency, embedded,
  java, spring,
  docker, kubernetes, cicd, git, linux, bash, terraform, ansible, cloud, networking, nginx, monitoring, windows,
  sql, nosql, redis,
  python, csharp, go, rust,
  javascript, typescript, react, node, nextjs, angular, vue, htmlCss, rest, php, odoo,
  algorithms, oop, security, testing, agile, architecture, llm,
];
