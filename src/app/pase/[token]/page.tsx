import type { Metadata } from "next";
import Link from "next/link";
import DigitalPassView from "@/components/DigitalPassView";
import { decodePassToken, resolvePassContext } from "@/lib/passCodec";

interface PassPageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const title =
    "Tienes un Pagaré de Tiempo · Grupo Orgánico Hoteles Boutique";
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

export default async function PassPage({ params }: PassPageProps) {
  const { token } = await params;
  const decoded = decodePassToken(token);
  const context = resolvePassContext(decoded);

  if (!context) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-tinta-archivo px-6 py-16 text-center text-papel-algodon paper-texture-dark">
        <div className="max-w-lg border border-bronce-antiguo/45 bg-tinta-archivo/90 p-8 sm:p-10">
          <span className="border border-lacre-borgona bg-lacre-borgona/25 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-papel-algodon">
            ENLACE NO VÁLIDO O INCOMPLETO
          </span>
          <h1 className="mt-6 font-serif text-3xl font-normal text-papel-algodon sm:text-4xl">
            No pudimos abrir este{" "}
            <span className="italic text-bronce-antiguo">Pagaré de Tiempo</span>
          </h1>
          <p className="mt-4 font-sans text-sm font-light leading-relaxed text-papel-algodon/75">
            El enlace de invitación puede haberse copiado incompleto. Pide a
            quien te lo envió o a nuestro equipo de Concierge que te compartan
            el enlace completo.
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

  const isSecret = context.pass.destinoSecreto;

  return (
    <DigitalPassView
      pass={context.pass}
      packingHints={context.hotel.packingHints}
      hotel={isSecret ? null : context.hotel}
      experiencia={isSecret ? null : context.experiencia}
    />
  );
}

