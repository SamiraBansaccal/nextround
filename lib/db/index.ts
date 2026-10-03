import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

// Neon's HTTP driver: one HTTPS request per query, well suited to serverless functions.
// Created lazily so that importing this module never needs the database (e.g. at build time).
let instance: ReturnType<typeof createDb> | undefined;

function createDb() {
  return drizzle(neon(serverEnv().DB_CONNECTION_STRING), { schema });
}

export function getDb() {
  instance ??= createDb();
  return instance;
}
