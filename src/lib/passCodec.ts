import { getHotelBySlug, type Experience, type Hotel } from "@/data/hotels";

export interface PassData {
  folio: string;
  remitente: string;
  destinatario: string;
  hotelSlug: string;
  experienciaIndex: 0 | 1;
  fechaLlegada: string;
  dedicatoria: string;
  destinoSecreto: boolean;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(token: string): Uint8Array {
  const cleanToken = token.trim().replace(/-/g, "+").replace(/_/g, "/");
  const paddingNeeded = (4 - (cleanToken.length % 4)) % 4;
  const base64 = cleanToken + "=".repeat(paddingNeeded);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Codifica un objeto PassData en un token Base64 URL-safe compatible con UTF-8.
 */
export function encodePassToken(data: PassData): string {
  const payload: PassData = {
    folio: data.folio.trim(),
    remitente: data.remitente.trim(),
    destinatario: data.destinatario.trim(),
    hotelSlug: data.hotelSlug.trim(),
    experienciaIndex: data.experienciaIndex === 1 ? 1 : 0,
    fechaLlegada: data.fechaLlegada.trim(),
    dedicatoria: data.dedicatoria.trim(),
    destinoSecreto: Boolean(data.destinoSecreto),
  };

  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return bytesToBase64Url(bytes);
}

/**
 * Decodifica y valida un token Base64 URL-safe de vuelta a PassData.
 * Devuelve null si el token está dañado o no cumple la estructura mínima.
 */
export function decodePassToken(token: string): PassData | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const normalizedInput = decodeURIComponent(token).trim();
    if (!/^[A-Za-z0-9\-_]+={0,2}$/.test(normalizedInput)) {
      return null;
    }

    const bytes = base64UrlToBytes(normalizedInput);
    const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const parsed: unknown = JSON.parse(json);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const candidate = parsed as Record<string, unknown>;
    if (
      typeof candidate.folio !== "string" ||
      typeof candidate.remitente !== "string" ||
      typeof candidate.destinatario !== "string" ||
      typeof candidate.hotelSlug !== "string" ||
      typeof candidate.fechaLlegada !== "string" ||
      typeof candidate.dedicatoria !== "string"
    ) {
      return null;
    }

    const expIdx: 0 | 1 = candidate.experienciaIndex === 1 ? 1 : 0;

    return {
      folio: candidate.folio,
      remitente: candidate.remitente,
      destinatario: candidate.destinatario,
      hotelSlug: candidate.hotelSlug,
      experienciaIndex: expIdx,
      fechaLlegada: candidate.fechaLlegada,
      dedicatoria: candidate.dedicatoria,
      destinoSecreto: Boolean(candidate.destinoSecreto),
    };
  } catch {
    return null;
  }
}

export interface ResolvedPassContext {
  pass: PassData;
  hotel: Hotel;
  experiencia: Experience;
}

export function resolvePassContext(
  pass: PassData | null
): ResolvedPassContext | null {
  if (!pass) {
    return null;
  }
  const hotel = getHotelBySlug(pass.hotelSlug);
  if (!hotel || hotel.experiencias.length === 0) {
    return null;
  }
  const experiencia =
    hotel.experiencias[pass.experienciaIndex] ?? hotel.experiencias[0];

  return {
    pass,
    hotel,
    experiencia,
  };
}

export function generateSuggestedFolio(): string {
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `GO-2027-${randomNum}`;
}

