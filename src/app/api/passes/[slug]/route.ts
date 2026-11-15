import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";
import { dbErrorResponse, requireConciergeAuth } from "@/lib/apiHelpers";
import {
  deletePassBySlug,
  findPassBySlug,
  serializePassRecord,
  updatePassBySlug,
  validatePatchPassInput,
} from "@/lib/passRepository";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const unauthorized = await requireConciergeAuth();
  if (unauthorized) return unauthorized;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Base de datos Neon no configurada aún." },
      { status: 503 }
    );
  }

  try {
    const { slug } = await params;
    const found = await findPassBySlug(slug);
    if (!found) {
      return NextResponse.json(
        { error: "No encontramos un pase con ese identificador." },
        { status: 404 }
      );
    }
    return NextResponse.json({ pass: serializePassRecord(found) });
  } catch (error) {
    return dbErrorResponse(
      error,
      "No pudimos obtener el detalle del pase en Neon."
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const unauthorized = await requireConciergeAuth();
  if (unauthorized) return unauthorized;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Base de datos Neon no configurada aún." },
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

  const validation = validatePatchPassInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const { slug } = await params;
    const updated = await updatePassBySlug(slug, validation.data);
    if (!updated) {
      return NextResponse.json(
        { error: "No encontramos un pase con ese identificador." },
        { status: 404 }
      );
    }
    return NextResponse.json({ pass: updated });
  } catch (error) {
    return dbErrorResponse(
      error,
      "No pudimos actualizar el pase en Neon Postgres."
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const unauthorized = await requireConciergeAuth();
  if (unauthorized) return unauthorized;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Base de datos Neon no configurada aún." },
      { status: 503 }
    );
  }

  try {
    const { slug } = await params;
    const deleted = await deletePassBySlug(slug);
    if (!deleted) {
      return NextResponse.json(
        { error: "No encontramos un pase con ese identificador." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return dbErrorResponse(
      error,
      "No pudimos eliminar el pase en Neon Postgres."
    );
  }
}

