import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { CONCIERGE_PIN as DEFAULT_CONCIERGE_PIN } from "@/data/hotels";

export const CONCIERGE_COOKIE_NAME = "gohb_concierge_session";
const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días
const SESSION_FALLBACK_TTL_SECONDS = 60 * 60 * 12; // 12 horas

export function getExpectedConciergePin(): string {
  const envPin = process.env.CONCIERGE_PIN?.trim();
  return envPin && envPin.length > 0 ? envPin : DEFAULT_CONCIERGE_PIN;
}

function sha256Buffer(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function getSigningKey(): Buffer {
  const secretSource =
    process.env.AUTH_SECRET?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    getExpectedConciergePin();

  return sha256Buffer(`gohb:concierge:v1:${secretSource}`);
}

export function verifyConciergePin(candidatePin: string): boolean {
  const candidate = candidatePin.trim();
  const expected = getExpectedConciergePin();
  if (!candidate) {
    return false;
  }

  return timingSafeEqual(sha256Buffer(candidate), sha256Buffer(expected));
}

export function createConciergeSessionToken(remember: boolean): {
  token: string;
  maxAge?: number;
} {
  const ttlSeconds = remember
    ? REMEMBER_MAX_AGE_SECONDS
    : SESSION_FALLBACK_TTL_SECONDS;
  const expiresAtMs = Date.now() + ttlSeconds * 1000;
  const payload = String(expiresAtMs);
  const sigHex = createHmac("sha256", getSigningKey())
    .update(payload, "utf8")
    .digest("hex");

  return {
    token: `${payload}.${sigHex}`,
    ...(remember ? { maxAge: REMEMBER_MAX_AGE_SECONDS } : {}),
  };
}

export function verifyConciergeSessionToken(
  rawToken: string | undefined
): boolean {
  if (!rawToken || typeof rawToken !== "string") {
    return false;
  }

  const parts = rawToken.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payload, sigHex] = parts;
  if (!/^\d+$/.test(payload) || !/^[0-9a-f]{64}$/i.test(sigHex)) {
    return false;
  }

  const expiresAtMs = Number(payload);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    return false;
  }

  const expectedHex = createHmac("sha256", getSigningKey())
    .update(payload, "utf8")
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(sigHex.toLowerCase(), "utf8"),
    Buffer.from(expectedHex.toLowerCase(), "utf8")
  );
}

export async function isConciergeRequestAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CONCIERGE_COOKIE_NAME);
  return verifyConciergeSessionToken(cookie?.value);
}

