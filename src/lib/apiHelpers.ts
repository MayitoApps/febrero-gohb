import { NextResponse } from "next/server";
import { isConciergeRequestAuthorized } from "@/lib/conciergeAuth";

export async function requireConciergeAuth(): Promise<NextResponse | null> {
  const authorized = await isConciergeRequestAuthorized();
  if (!authorized) {
    return NextResponse.json(
      { error: "Sesión de Concierge requerida o expirada." },
      { status: 401 }
    );
  }
  return null;
}

export function dbErrorResponse(error: unknown, fallbackMessage: string) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code === "42P01") {
    return NextResponse.json(
      {
        error:
          "La tabla «passes» aún no existe en tu base de datos Neon. Ejecuta `npm run db:migrate` (o `npx drizzle-kit migrate`) tras configurar DATABASE_URL.",
        code: "MIGRATIONS_PENDING",
      },
      { status: 503 }
    );
  }

  console.error("[gohb:api]", error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

