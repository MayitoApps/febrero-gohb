import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/db";
import { recordPassOpenBySlug } from "@/lib/passRepository";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false });
  }

  try {
    const { slug } = await params;
    const updated = await recordPassOpenBySlug(slug);
    return NextResponse.json({ ok: updated });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

