import { randomBytes } from "node:crypto";
import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { getHotelBySlug } from "@/data/hotels";
import { getDb } from "@/db";
import {
  passes,
  type PassRecord,
  type PassRecordDto,
  type PassStatus,
} from "@/db/schema";
import type { PassData } from "@/lib/passCodec";
import { normalizeSelectedIsoDates } from "@/lib/passDates";

const SLUG_RANDOM_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export const VALID_PASS_STATUSES: readonly PassStatus[] = [
  "activo",
  "canjeado",
  "cancelado",
];

/**
 * Un Base64URL válido de PassData JSON supera fácilmente los 130 caracteres.
 * Todo token corto <= 64 caracteres alfanuméricos con guiones se trata como slug de Neon.
 */
export function isPotentialDbSlug(token: string): boolean {
  if (!token || typeof token !== "string") {
    return false;
  }
  const clean = token.trim();
  return clean.length >= 4 && clean.length <= 64 && /^[A-Za-z0-9_-]+$/.test(clean);
}

function sanitizeOptionalText(
  value: unknown,
  maxLength: number
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function sanitizeRequiredText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export interface ValidatedCreatePassInput {
  folio: string;
  remitente: string;
  destinatario: string;
  hotelSlug: string;
  experienciaIndex: 0 | 1;
  fechaLlegada: string;
  fechasSeleccionadas: string[];
  dedicatoria: string;
  destinoSecreto: boolean;
  revealAt: Date | null;
  estado: PassStatus;
  contactoCliente: string | null;
  notasConcierge: string | null;
}

export type ValidatedPatchPassInput = Partial<ValidatedCreatePassInput>;

export function validateCreatePassInput(
  rawBody: unknown
):
  | { ok: true; data: ValidatedCreatePassInput }
  | { ok: false; error: string } {
  if (!rawBody || typeof rawBody !== "object") {
    return { ok: false, error: "Cuerpo JSON inválido." };
  }

  const body = rawBody as Record<string, unknown>;
  const folio = sanitizeRequiredText(body.folio, 48);
  const remitente = sanitizeRequiredText(body.remitente, 120);
  const destinatario = sanitizeRequiredText(body.destinatario, 120);
  const hotelSlugRaw = sanitizeRequiredText(body.hotelSlug, 64);
  const fechaLlegada = sanitizeRequiredText(body.fechaLlegada, 220);
  const dedicatoria = sanitizeRequiredText(body.dedicatoria, 1800);

  if (!folio) return { ok: false, error: "El folio es obligatorio." };
  if (!remitente) {
    return { ok: false, error: "El nombre de quien regala es obligatorio." };
  }
  if (!destinatario) {
    return { ok: false, error: "El nombre de quien recibe es obligatorio." };
  }
  if (!fechaLlegada) {
    return { ok: false, error: "La fecha y hora de cita es obligatoria." };
  }
  if (!dedicatoria) {
    return { ok: false, error: "La dedicatoria es obligatoria." };
  }

  const hotel = hotelSlugRaw ? getHotelBySlug(hotelSlugRaw) : undefined;
  if (!hotel) {
    return { ok: false, error: "El hotel seleccionado no es válido." };
  }

  const rawExp = Number(body.experienciaIndex);
  const experienciaIndex: 0 | 1 =
    rawExp === 1 && hotel.experiencias.length > 1 ? 1 : 0;

  const rawDates = Array.isArray(body.fechasSeleccionadas)
    ? body.fechasSeleccionadas.filter(
        (d): d is string => typeof d === "string"
      )
    : [];
  const fechasSeleccionadas = normalizeSelectedIsoDates(rawDates);

  let revealAt: Date | null = null;
  if (typeof body.revealAt === "string" && body.revealAt.trim().length > 0) {
    const parsed = new Date(body.revealAt.trim());
    if (Number.isNaN(parsed.getTime())) {
      return {
        ok: false,
        error: "La fecha programada de revelación no es válida.",
      };
    }
    revealAt = parsed;
  }

  let estado: PassStatus = "activo";
  if (
    typeof body.estado === "string" &&
    (VALID_PASS_STATUSES as readonly string[]).includes(body.estado)
  ) {
    estado = body.estado as PassStatus;
  }

  return {
    ok: true,
    data: {
      folio,
      remitente,
      destinatario,
      hotelSlug: hotel.slug,
      experienciaIndex,
      fechaLlegada,
      fechasSeleccionadas,
      dedicatoria,
      destinoSecreto: Boolean(body.destinoSecreto),
      revealAt,
      estado,
      contactoCliente: sanitizeOptionalText(body.contactoCliente, 180) ?? null,
      notasConcierge: sanitizeOptionalText(body.notasConcierge, 1000) ?? null,
    },
  };
}

export function validatePatchPassInput(
  rawBody: unknown
):
  | { ok: true; data: ValidatedPatchPassInput }
  | { ok: false; error: string } {
  if (!rawBody || typeof rawBody !== "object") {
    return { ok: false, error: "Cuerpo JSON inválido." };
  }

  const body = rawBody as Record<string, unknown>;
  const patch: ValidatedPatchPassInput = {};

  if ("folio" in body) {
    const folio = sanitizeRequiredText(body.folio, 48);
    if (!folio) return { ok: false, error: "El folio no puede estar vacío." };
    patch.folio = folio;
  }

  if ("remitente" in body) {
    const remitente = sanitizeRequiredText(body.remitente, 120);
    if (!remitente) {
      return { ok: false, error: "El remitente no puede estar vacío." };
    }
    patch.remitente = remitente;
  }

  if ("destinatario" in body) {
    const destinatario = sanitizeRequiredText(body.destinatario, 120);
    if (!destinatario) {
      return { ok: false, error: "El destinatario no puede estar vacío." };
    }
    patch.destinatario = destinatario;
  }

  if ("hotelSlug" in body) {
    const hotelSlug = sanitizeRequiredText(body.hotelSlug, 64);
    const hotel = hotelSlug ? getHotelBySlug(hotelSlug) : undefined;
    if (!hotel) {
      return { ok: false, error: "El hotel seleccionado no es válido." };
    }
    patch.hotelSlug = hotel.slug;
    if ("experienciaIndex" in body) {
      patch.experienciaIndex =
        Number(body.experienciaIndex) === 1 && hotel.experiencias.length > 1
          ? 1
          : 0;
    }
  } else if ("experienciaIndex" in body) {
    patch.experienciaIndex = Number(body.experienciaIndex) === 1 ? 1 : 0;
  }

  if ("fechaLlegada" in body) {
    const fechaLlegada = sanitizeRequiredText(body.fechaLlegada, 220);
    if (!fechaLlegada) {
      return { ok: false, error: "La fecha de cita no puede estar vacía." };
    }
    patch.fechaLlegada = fechaLlegada;
  }

  if ("fechasSeleccionadas" in body) {
    const rawDates = Array.isArray(body.fechasSeleccionadas)
      ? body.fechasSeleccionadas.filter(
          (d): d is string => typeof d === "string"
        )
      : [];
    patch.fechasSeleccionadas = normalizeSelectedIsoDates(rawDates);
  }

  if ("dedicatoria" in body) {
    const dedicatoria = sanitizeRequiredText(body.dedicatoria, 1800);
    if (!dedicatoria) {
      return { ok: false, error: "La dedicatoria no puede estar vacía." };
    }
    patch.dedicatoria = dedicatoria;
  }

  if ("destinoSecreto" in body) {
    patch.destinoSecreto = Boolean(body.destinoSecreto);
  }

  if ("revealAt" in body) {
    if (body.revealAt === null || body.revealAt === "") {
      patch.revealAt = null;
    } else if (typeof body.revealAt === "string") {
      const parsed = new Date(body.revealAt.trim());
      if (Number.isNaN(parsed.getTime())) {
        return {
          ok: false,
          error: "La fecha programada de revelación no es válida.",
        };
      }
      patch.revealAt = parsed;
    }
  }

  if ("estado" in body) {
    if (
      typeof body.estado !== "string" ||
      !(VALID_PASS_STATUSES as readonly string[]).includes(body.estado)
    ) {
      return { ok: false, error: "El estado proporcionado no es válido." };
    }
    patch.estado = body.estado as PassStatus;
  }

  if ("contactoCliente" in body) {
    patch.contactoCliente =
      sanitizeOptionalText(body.contactoCliente, 180) ?? null;
  }

  if ("notasConcierge" in body) {
    patch.notasConcierge =
      sanitizeOptionalText(body.notasConcierge, 1000) ?? null;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "No se recibieron cambios por guardar." };
  }

  return { ok: true, data: patch };
}

function generateShortPassSlug(folio: string): string {
  const base = folio
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  const bytes = randomBytes(5);
  let suffix = "";
  for (let i = 0; i < 5; i += 1) {
    suffix += SLUG_RANDOM_ALPHABET[bytes[i] % SLUG_RANDOM_ALPHABET.length];
  }

  return `${base || "pase"}-${suffix}`;
}

export function serializePassRecord(record: PassRecord): PassRecordDto {
  return {
    id: record.id,
    slug: record.slug,
    folio: record.folio,
    remitente: record.remitente,
    destinatario: record.destinatario,
    hotelSlug: record.hotelSlug,
    experienciaIndex: record.experienciaIndex === 1 ? 1 : 0,
    fechaLlegada: record.fechaLlegada,
    fechasSeleccionadas: Array.isArray(record.fechasSeleccionadas)
      ? normalizeSelectedIsoDates(record.fechasSeleccionadas)
      : [],
    dedicatoria: record.dedicatoria,
    destinoSecreto: record.destinoSecreto,
    revealAt: record.revealAt ? record.revealAt.toISOString() : null,
    estado: record.estado,
    contactoCliente: record.contactoCliente ?? null,
    notasConcierge: record.notasConcierge ?? null,
    openedAt: record.openedAt ? record.openedAt.toISOString() : null,
    lastOpenedAt: record.lastOpenedAt
      ? record.lastOpenedAt.toISOString()
      : null,
    openCount: record.openCount,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function recordToPassData(record: PassRecord): PassData {
  const fechas = Array.isArray(record.fechasSeleccionadas)
    ? normalizeSelectedIsoDates(record.fechasSeleccionadas)
    : [];

  return {
    folio: record.folio,
    remitente: record.remitente,
    destinatario: record.destinatario,
    hotelSlug: record.hotelSlug,
    experienciaIndex: record.experienciaIndex === 1 ? 1 : 0,
    fechaLlegada: record.fechaLlegada,
    ...(fechas.length > 0 ? { fechasSeleccionadas: fechas } : {}),
    dedicatoria: record.dedicatoria,
    destinoSecreto: record.destinoSecreto,
  };
}

export function computeSuggestedNextFolio(existingFolios: string[]): string {
  let maxNumber = 0;
  for (const folio of existingFolios) {
    const match = folio.trim().match(/^GO-2027-(\d+)$/i);
    if (match) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n > maxNumber) {
        maxNumber = n;
      }
    }
  }
  const next = maxNumber + 1;
  return `GO-2027-${String(next).padStart(3, "0")}`;
}

export async function findPassBySlug(slug: string): Promise<PassRecord | null> {
  const db = getDb();
  if (!db) return null;

  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) return null;

  const rows = await db
    .select()
    .from(passes)
    .where(eq(passes.slug, cleanSlug))
    .limit(1);

  return rows[0] ?? null;
}

export async function listPassesInDb(filters?: {
  search?: string;
  hotelSlug?: string;
  estado?: string;
}): Promise<{
  items: PassRecordDto[];
  suggestedNextFolio: string;
}> {
  const db = getDb();
  if (!db) {
    return { items: [], suggestedNextFolio: "GO-2027-001" };
  }

  const conditions = [];
  const search = filters?.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(passes.folio, pattern),
        ilike(passes.remitente, pattern),
        ilike(passes.destinatario, pattern),
        ilike(passes.slug, pattern)
      )
    );
  }

  const hotelSlug = filters?.hotelSlug?.trim();
  if (hotelSlug && hotelSlug !== "todos") {
    conditions.push(eq(passes.hotelSlug, hotelSlug));
  }

  const estado = filters?.estado?.trim();
  if (
    estado &&
    estado !== "todos" &&
    (VALID_PASS_STATUSES as readonly string[]).includes(estado)
  ) {
    conditions.push(eq(passes.estado, estado as PassStatus));
  }

  const [rows, allFolios] = await Promise.all([
    conditions.length > 0
      ? db
          .select()
          .from(passes)
          .where(and(...conditions))
          .orderBy(desc(passes.createdAt))
          .limit(200)
      : db.select().from(passes).orderBy(desc(passes.createdAt)).limit(200),
    db.select({ folio: passes.folio }).from(passes),
  ]);

  return {
    items: rows.map(serializePassRecord),
    suggestedNextFolio: computeSuggestedNextFolio(
      allFolios.map((r) => r.folio)
    ),
  };
}

export async function createPassInDb(
  input: ValidatedCreatePassInput
): Promise<PassRecordDto> {
  const db = getDb();
  if (!db) {
    throw new Error("Base de datos Neon no configurada.");
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = generateShortPassSlug(input.folio);
    try {
      const [created] = await db
        .insert(passes)
        .values({
          slug,
          folio: input.folio,
          remitente: input.remitente,
          destinatario: input.destinatario,
          hotelSlug: input.hotelSlug,
          experienciaIndex: input.experienciaIndex,
          fechaLlegada: input.fechaLlegada,
          fechasSeleccionadas: input.fechasSeleccionadas,
          dedicatoria: input.dedicatoria,
          destinoSecreto: input.destinoSecreto,
          revealAt: input.revealAt,
          estado: input.estado,
          contactoCliente: input.contactoCliente,
          notasConcierge: input.notasConcierge,
        })
        .returning();

      return serializePassRecord(created);
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: unknown }).code)
          : "";
      if (code === "23505" && attempt < 2) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No se pudo generar un identificador único para el pase.");
}

export async function updatePassBySlug(
  slug: string,
  patch: ValidatedPatchPassInput
): Promise<PassRecordDto | null> {
  const db = getDb();
  if (!db) {
    throw new Error("Base de datos Neon no configurada.");
  }

  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) return null;

  const existing = await findPassBySlug(cleanSlug);
  if (!existing) return null;

  // Asegurar que experienciaIndex sea válido si cambia de hotel (p. ej. Frontera 49 solo tiene índice 0)
  const targetHotelSlug = patch.hotelSlug ?? existing.hotelSlug;
  const targetHotel = getHotelBySlug(targetHotelSlug);
  const nextExpIndex = patch.experienciaIndex ?? existing.experienciaIndex;
  const safeExpIndex: 0 | 1 =
    targetHotel && nextExpIndex === 1 && targetHotel.experiencias.length > 1
      ? 1
      : 0;

  const [updated] = await db
    .update(passes)
    .set({
      ...patch,
      experienciaIndex: safeExpIndex,
      updatedAt: new Date(),
    })
    .where(eq(passes.slug, cleanSlug))
    .returning();

  return updated ? serializePassRecord(updated) : null;
}

export async function deletePassBySlug(slug: string): Promise<boolean> {
  const db = getDb();
  if (!db) {
    throw new Error("Base de datos Neon no configurada.");
  }

  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) return false;

  const deleted = await db
    .delete(passes)
    .where(eq(passes.slug, cleanSlug))
    .returning({ id: passes.id });

  return deleted.length > 0;
}

export async function recordPassOpenBySlug(slug: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) return false;

  const now = new Date();
  const updated = await db
    .update(passes)
    .set({
      openedAt: sql`COALESCE(${passes.openedAt}, ${now})`,
      lastOpenedAt: now,
      openCount: sql`${passes.openCount} + 1`,
    })
    .where(and(eq(passes.slug, cleanSlug), ne(passes.estado, "cancelado")))
    .returning({ id: passes.id });

  return updated.length > 0;
}

