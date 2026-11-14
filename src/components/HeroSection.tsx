"use client";

import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden border-b border-bronce-antiguo/30 bg-tinta-archivo paper-texture-dark">
      {/* Líneas arquitectónicas verticales de relojería / archivo */}
      <div
        className="pointer-events-none absolute inset-0 mx-auto max-w-7xl border-x border-bronce-antiguo/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bronce-antiguo/40 to-transparent"
        aria-hidden="true"
      />

      {/* Contenido Central */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
        {/* Etiqueta superior en JetBrains Mono */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8 inline-flex items-center gap-3 border border-lacre-borgona/80 bg-lacre-borgona/25 px-4 py-2 shadow-sm"
        >
          <span
            className="h-2 w-2 rounded-full bg-lacre-borgona ring-2 ring-bronce-antiguo/50"
            aria-hidden="true"
          />
          <span className="font-mono text-xs uppercase tracking-widest text-papel-algodon">
            EDICIÓN LIMITADA · 20 PACTOS POR PROPIEDAD
          </span>
        </motion.div>

        {/* Línea de tiempo dorada 14.02.2027 ————————— 14.02.2028 */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.92 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
          className="mb-8 flex w-full max-w-xl items-center justify-center gap-3 sm:gap-5"
        >
          <div className="flex flex-col items-end">
            <span className="font-mono text-xs tracking-widest text-bronce-antiguo sm:text-sm">
              14.02.2027
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-papel-algodon/50">
              LA FIRMA
            </span>
          </div>

          <div className="relative flex flex-1 items-center">
            <span className="h-1.5 w-1.5 rotate-45 border border-bronce-antiguo bg-tinta-archivo" />
            <div className="relative h-px flex-1 bg-bronce-antiguo/60">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.6, delay: 0.4, ease: "easeInOut" }}
                className="h-full bg-bronce-antiguo"
              />
            </div>
            <span className="mx-2 font-mono text-[10px] uppercase tracking-[0.25em] text-bronce-antiguo/90">
              365 DÍAS
            </span>
            <div className="h-px flex-1 bg-bronce-antiguo/60" />
            <span className="h-1.5 w-1.5 rotate-45 bg-bronce-antiguo" />
          </div>

          <div className="flex flex-col items-start">
            <span className="font-mono text-xs tracking-widest text-bronce-antiguo sm:text-sm">
              14.02.2028
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-papel-algodon/50">
              EL REGRESO
            </span>
          </div>
        </motion.div>

        {/* H1 Principal en Cormorant Garamond */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: "easeOut" }}
          className="font-serif text-5xl font-normal leading-[1.04] tracking-tight text-papel-algodon sm:text-6xl md:text-7xl lg:text-[5.25rem]"
        >
          El Tiempo Que{" "}
          <span className="italic text-bronce-antiguo">Nos Debemos</span>
        </motion.h1>

        {/* Subtítulo emotivo */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.35, ease: "easeOut" }}
          className="mx-auto mt-7 max-w-2xl font-sans text-base font-light leading-relaxed text-papel-algodon/85 sm:text-lg md:text-xl"
        >
          No celebres lo que ya pasó. Este 14 de febrero escapa de la prisa,
          vive una experiencia privada y firma junto a tu pareja su hoja
          personalizada donde apartan desde hoy su cita del 2028.
        </motion.p>

        {/* Acciones / CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.5, ease: "easeOut" }}
          className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:gap-5"
        >
          <a
            href="#destinos"
            className="group inline-flex w-full items-center justify-center gap-3 border border-bronce-antiguo bg-bronce-antiguo px-8 py-4 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-tinta-archivo transition-all duration-300 hover:bg-papel-algodon hover:border-papel-algodon sm:w-auto"
          >
            <span>Elegir nuestro destino</span>
            <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </a>

          <a
            href="#ritual"
            className="inline-flex w-full items-center justify-center gap-2 border border-bronce-antiguo/50 bg-verde-organico/50 px-8 py-4 font-sans text-sm font-medium uppercase tracking-[0.16em] text-papel-algodon transition-all duration-300 hover:border-bronce-antiguo hover:bg-verde-organico sm:w-auto"
          >
            <span>Ver cómo funciona el pacto</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
