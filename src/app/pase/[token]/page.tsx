import type { Metadata } from "next";
import Link from "next/link";
import DigitalPassView from "@/components/DigitalPassView";
import { isDatabaseConfigured } from "@/db";
import { decodePassToken, resolvePassContext } from "@/lib/passCodec";
import {
  findPassBySlug,
  isPotentialDbSlug,
  recordToPassData,
} from "@/lib/passRepository";

export const dynamic = "force-dynamic";

interface PassPageProps {
  params: Promise<{
    token: string;
  }>;
}

function formatRevealAtCdmx(date: Date): string {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      timeZone: "America/Mexico_City",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const title =
    "Tienes una Invitación Digital · Grupo Orgánico Hoteles Boutique";
  const description =
    "Alguien especial apartó este 14 de febrero para escribir su próxima historia juntos.";

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      siteName: "Grupo Orgánico Hoteles Boutique",
      images: [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [],
    },
  };
}

function InvalidPassScreen({
  badge = "ENLACE NO VÁLIDO O INCOMPLETO",
  heading = "No pudimos abrir esta",
  body = "El enlace de invitación puede haberse copiado incompleto. Pide a quien te lo envió o a nuestro equipo de Concierge que te compartan el enlace completo.",
}: {
  badge?: string;
  heading?: string;
  body?: string;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-tinta-archivo px-6 py-16 text-center text-papel-algodon paper-texture-dark">
      <div className="max-w-lg border border-bronce-antiguo/45 bg-tinta-archivo/90 p-8 sm:p-10">
        <span className="border border-lacre-borgona bg-lacre-borgona/25 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-papel-algodon">
          {badge}
        </span>
        <h1 className="mt-6 font-serif text-3xl font-normal text-papel-algodon sm:text-4xl">
          {heading}{" "}
          <span className="italic text-bronce-antiguo">Invitación Digital</span>
        </h1>
        <p className="mt-4 font-sans text-sm font-light leading-relaxed text-papel-algodon/75">
          {body}
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center justify-center border border-bronce-antiguo bg-bronce-antiguo px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-tinta-archivo transition-colors hover:bg-papel-algodon"
        >
          Ir a la campaña «El Tiempo Que Nos Debemos»
        </Link>
      </div>
    </main>
  );
}

export default async function PassPage({ params }: PassPageProps) {
  const { token } = await params;

  // 1) Si el segmento parece un slug corto de Neon y hay BD configurada, resolver desde Postgres
  if (isPotentialDbSlug(token) && isDatabaseConfigured()) {
    let record = null;
    try {
      record = await findPassBySlug(token);
    } catch {
      record = null;
    }

    if (!record) {
      return <InvalidPassScreen />;
    }

    if (record.estado === "cancelado") {
      return (
        <InvalidPassScreen
          badge="INVITACIÓN ANULADA O REPROGRAMADA"
          heading="Ya no está activa esta"
          body="El folio asociado fue cancelado o reemplazado por una nueva reservación. Comunícate con quien te envió la invitación o con el Concierge de Grupo Orgánico para recibir asistencia."
        />
      );
    }

    const basePass = recordToPassData(record);
    const context = resolvePassContext(basePass);
    if (!context) {
      return <InvalidPassScreen />;
    }

    const now = new Date();
    const isSecret =
      record.destinoSecreto &&
      (!record.revealAt || now.getTime() < record.revealAt.getTime());

    const safePass = {
      ...context.pass,
      destinoSecreto: isSecret,
      hotelSlug: isSecret ? "confidencial" : context.pass.hotelSlug,
    };

    return (
      <DigitalPassView
        pass={safePass}
        packingHints={context.hotel.packingHints}
        hotel={isSecret ? null : context.hotel}
        experiencia={isSecret ? null : context.experiencia}
        passSlug={record.slug}
        revealAtLabel={
          isSecret && record.revealAt
            ? formatRevealAtCdmx(record.revealAt)
            : null
        }
      />
    );
  }

  // 2) Fallback retrocompatible para tokens Base64URL sin base de datos
  const decoded = decodePassToken(token);
  const context = resolvePassContext(decoded);

  if (!context) {
    return <InvalidPassScreen />;
  }

  const isSecret = context.pass.destinoSecreto;
  const safePass = isSecret
    ? { ...context.pass, hotelSlug: "confidencial" }
    : context.pass;

  return (
    <DigitalPassView
      pass={safePass}
      packingHints={context.hotel.packingHints}
      hotel={isSecret ? null : context.hotel}
      experiencia={isSecret ? null : context.experiencia}
    />
  );
}
