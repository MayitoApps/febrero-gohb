import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Carga .env.local primero en entorno local y luego .env
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const migrationUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
});

