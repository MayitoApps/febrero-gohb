import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";
import { dbErrorResponse, requireConciergeAuth } from "@/lib/apiHelpers";
import {
  createPassInDb,
  listPassesInDb,
  validateCreatePassInput,
} from "@/lib/passRepository";

export async function GET(request: Request) {
  const unauthorized = await requireConciergeAuth();
  if (unauthorized) return unauthorized;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      dbConfigured: false,
      passes: [],
      suggestedNextFolio: "GO-2027-001",
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const { items, suggestedNextFolio } = await listPassesInDb({
      search: searchParams.get("search") ?? undefined,
      hotelSlug: searchParams.get("hotelSlug") ?? undefined,
      estado: searchParams.get("estado") ?? undefined,
    });

    return NextResponse.json({
      dbConfigured: true,
      passes: items,
      suggestedNextFolio,
    });
  } catch (error) {
    return dbErrorResponse(
      error,
      "No pudimos consultar los pases en Neon Postgres."
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireConciergeAuth();
  if (unauthorized) return unauthorized;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Base de datos Neon no configurada aún (falta DATABASE_URL en entorno).",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON inválido." },
      { status: 400 }
    );
  }

  const validation = validateCreatePassInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const created = await createPassInDb(validation.data);
    return NextResponse.json({ pass: created }, { status: 201 });
  } catch (error) {
    return dbErrorResponse(
      error,
      "No pudimos guardar el pase en Neon Postgres."
    );
  }
}

