import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";
import {
  CONCIERGE_COOKIE_NAME,
  createConciergeSessionToken,
  isConciergeRequestAuthorized,
  verifyConciergePin,
} from "@/lib/conciergeAuth";

export async function GET() {
  const authenticated = await isConciergeRequestAuthorized();
  return NextResponse.json({
    authenticated,
    dbConfigured: isDatabaseConfigured(),
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida." },
      { status: 400 }
    );
  }

  const candidate =
    body && typeof body === "object" && "pin" in body
      ? String((body as { pin?: unknown }).pin ?? "")
      : "";
  const remember =
    body && typeof body === "object" && "remember" in body
      ? Boolean((body as { remember?: unknown }).remember)
      : true;

  if (!verifyConciergePin(candidate)) {
    return NextResponse.json(
      { error: "PIN incorrecto. Verifica el código de acceso interno." },
      { status: 401 }
    );
  }

  const { token, maxAge } = createConciergeSessionToken(remember);
  const response = NextResponse.json({
    authenticated: true,
    dbConfigured: isDatabaseConfigured(),
  });

  response.cookies.set(CONCIERGE_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(maxAge ? { maxAge } : {}),
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.delete(CONCIERGE_COOKIE_NAME);
  return response;
}

