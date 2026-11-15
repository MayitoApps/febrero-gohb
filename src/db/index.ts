import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type AppDatabase = NeonHttpDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __gohbDb?: {
    url: string;
    instance: AppDatabase;
  };
};

/**
 * Obtiene la cadena de conexión pooled principal para consultas serverless en Neon/Vercel.
 */
export function getDatabaseUrl(): string | null {
  const candidate =
    process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || "";
  return candidate.length > 0 ? candidate : null;
}

/**
 * Obtiene la cadena directa (sin pooler) recomendada para migraciones DDL.
 */
export function getDirectDatabaseUrl(): string | null {
  const candidate =
    process.env.DIRECT_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    getDatabaseUrl() ||
    "";
  return candidate.length > 0 ? candidate : null;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

/**
 * Devuelve una instancia reutilizable de Drizzle sobre Neon HTTP o null si falta configurar DATABASE_URL.
 */
export function getDb(): AppDatabase | null {
  const url = getDatabaseUrl();
  if (!url) {
    return null;
  }

  if (globalForDb.__gohbDb && globalForDb.__gohbDb.url === url) {
    return globalForDb.__gohbDb.instance;
  }

  const sql = neon(url);
  const instance = drizzle(sql, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__gohbDb = { url, instance };
  }

  return instance;
}

