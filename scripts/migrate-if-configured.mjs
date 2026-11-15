import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const url =
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL_UNPOOLED?.trim() ||
  process.env.POSTGRES_URL_NON_POOLING?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  "";

if (!url) {
  console.log(
    "[gohb:db] DATABASE_URL / DIRECT_URL no definida; omitiendo migraciones de Neon."
  );
  process.exit(0);
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(currentDir, "../drizzle");

const sql = neon(url);
const db = drizzle(sql);

console.log("[gohb:db] Aplicando migraciones pendientes en Neon Postgres...");
await migrate(db, { migrationsFolder });
console.log("[gohb:db] Migraciones aplicadas correctamente.");

