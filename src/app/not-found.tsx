import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-tinta-archivo text-papel-algodon paper-texture-dark">
      <Navbar variant="property" />
      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="border border-lacre-borgona bg-lacre-borgona/25 px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-papel-algodon">
          FOLIO NO LOCALIZADO · ERROR 404
        </span>
        <h1 className="mt-6 font-serif text-5xl font-normal text-papel-algodon sm:text-6xl">
          Este destino no figura en el{" "}
          <span className="italic text-bronce-antiguo">archivo 2027</span>
        </h1>
        <p className="mt-4 font-sans text-base font-light leading-relaxed text-papel-algodon/75">
          Explora las 5 propiedades participantes de Grupo Orgánico Hoteles
          Boutique para la campaña «El Tiempo Que Nos Debemos».
        </p>
        <Link
          href="/#destinos"
          className="mt-8 inline-flex items-center gap-2 border border-bronce-antiguo bg-bronce-antiguo px-7 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-tinta-archivo transition-colors hover:bg-papel-algodon"
        >
          <span>← Volver a los 5 destinos</span>
        </Link>
      </main>
    </div>
  );
}

