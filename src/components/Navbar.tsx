import Link from "next/link";

interface NavbarProps {
  variant?: "home" | "property";
}

export default function Navbar({ variant = "home" }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-bronce-antiguo/25 bg-tinta-archivo/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo tipográfico a la izquierda */}
        <Link
          href="/"
          className="group flex flex-col focus:outline-none"
          aria-label="Grupo Orgánico Hoteles Boutique - Inicio"
        >
          <span className="font-serif text-base font-medium tracking-[0.18em] text-papel-algodon transition-colors group-hover:text-bronce-antiguo sm:text-lg">
            GRUPO ORGÁNICO <span className="text-bronce-antiguo">·</span>{" "}
            <span className="font-normal italic tracking-[0.1em] text-papel-algodon/85">
              HOTELES BOUTIQUE
            </span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronce-antiguo/80">
            ARCHIVO TEMPORAL 2027 — 2028
          </span>
        </Link>

        {/* Navegación derecha + Badge de fecha */}
        <nav className="flex items-center gap-4 sm:gap-7">
          {variant === "property" ? (
            <Link
              href="/#destinos"
              className="hidden items-center gap-2 font-sans text-xs font-medium uppercase tracking-[0.16em] text-papel-algodon/80 transition-colors hover:text-bronce-antiguo sm:inline-flex"
            >
              <span>← Todos los destinos</span>
            </Link>
          ) : (
            <>
              <a
                href="#ritual"
                className="hidden font-sans text-xs font-normal uppercase tracking-[0.16em] text-papel-algodon/75 transition-colors hover:text-bronce-antiguo md:inline-block"
              >
                El Pacto
              </a>
              <a
                href="#destinos"
                className="font-sans text-xs font-medium uppercase tracking-[0.16em] text-papel-algodon/90 transition-colors hover:text-bronce-antiguo"
              >
                Explorar Destinos
              </a>
            </>
          )}

          <div className="flex items-center gap-2 border border-bronce-antiguo/45 bg-verde-organico/35 px-3 py-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-bronce-antiguo"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] uppercase tracking-widest text-papel-algodon">
              12 – 14 FEB 2027
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}

