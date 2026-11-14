"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Sparkles, ArrowRight } from "lucide-react";
import { HOTELS, type FilterCategory } from "@/data/hotels";

const CATEGORIES: { label: FilterCategory; count: number; hint: string }[] = [
  { label: "Todos", count: 5, hint: "5 propiedades" },
  {
    label: "Escapadas de Carretera",
    count: 3,
    hint: "Ajusco · Valle · Tepoztlán",
  },
  {
    label: "Experiencias en CDMX",
    count: 2,
    hint: "Roma Norte · Tlalpan",
  },
];

export default function HotelSelector() {
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("Todos");

  const filteredHotels =
    selectedCategory === "Todos"
      ? HOTELS
      : HOTELS.filter((hotel) => hotel.categoria === selectedCategory);

  return (
    <section
      id="destinos"
      className="relative border-b border-bronce-antiguo/30 bg-tinta-archivo paper-texture-dark py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado de sección */}
        <div className="flex flex-col justify-between gap-8 border-b border-bronce-antiguo/25 pb-10 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-bronce-antiguo" />
              <span className="font-mono text-xs uppercase tracking-widest text-bronce-antiguo">
                COLECCIÓN DE PROPIEDADES · CITA APARTADA: FEB 2028
              </span>
            </div>
            <h2 className="mt-3 font-serif text-4xl font-normal text-papel-algodon sm:text-5xl lg:text-6xl">
              ¿Dónde detendrán{" "}
              <span className="italic text-bronce-antiguo">el reloj?</span>
            </h2>
          </div>

          <p className="max-w-md font-sans text-sm font-light leading-relaxed text-papel-algodon/75 sm:text-base">
            Cada propiedad cuenta únicamente con{" "}
            <span className="font-medium text-papel-algodon">
              20 folios numerados
            </span>{" "}
            para el fin de semana del 12 al 14 de febrero de 2027. Elijan la
            atmósfera donde firmarán su pacto.
          </p>
        </div>

        {/* Barra de Filtros Interactiva */}
        <div
          className="mt-8 flex flex-wrap items-center gap-3"
          role="tablist"
          aria-label="Filtrar destinos por atmósfera"
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat.label)}
                className={`group relative flex items-center gap-3 border px-5 py-3 text-left transition-all duration-300 ${
                  isActive
                    ? "border-bronce-antiguo bg-bronce-antiguo text-tinta-archivo"
                    : "border-bronce-antiguo/35 bg-verde-organico/25 text-papel-algodon hover:border-bronce-antiguo/80 hover:bg-verde-organico/50"
                }`}
              >
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em]">
                  {cat.label}
                </span>
                <span
                  className={`font-mono text-[11px] tracking-widest ${
                    isActive
                      ? "text-tinta-archivo/80"
                      : "text-bronce-antiguo/90"
                  }`}
                >
                  [{cat.count}]
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid de 6 Tarjetas de Lujo (3x2 en desktop, 1 columna en móvil) */}
        <motion.div
          layout
          className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredHotels.map((hotel) => (
              <motion.article
                layout
                key={hotel.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="group relative flex flex-col justify-between border border-bronce-antiguo/35 bg-tinta-archivo transition-all duration-500 hover:-translate-y-1 hover:border-bronce-antiguo"
              >
                {/* Imagen superior con badge en lacre-borgona */}
                <div>
                  <div className="relative h-64 w-full overflow-hidden border-b border-bronce-antiguo/30 bg-verde-organico/30">
                    <Image
                      src={hotel.imagenPrincipal}
                      alt={`${hotel.nombre} - ${hotel.atmosfera}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tinta-archivo via-tinta-archivo/25 to-transparent" />

                    {/* Badge Superior de Folios Disponibles en lacre-borgona */}
                    <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 border border-papel-algodon/25 bg-lacre-borgona px-3.5 py-1.5 shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-papel-algodon animate-pulse" />
                      <span className="font-mono text-[11px] uppercase tracking-widest text-papel-algodon">
                        QUEDAN {hotel.foliosDisponibles} DE{" "}
                        {hotel.foliosTotales} FOLIOS
                      </span>
                    </div>

                    {/* Código de archivo notarial */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-papel-algodon/80">
                        {hotel.codigoArchivo}
                      </span>
                      <span className="border border-bronce-antiguo/45 bg-tinta-archivo/85 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                        CITA: FEB 2028
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo editorial de la tarjeta */}
                  <div className="p-6 sm:p-7">
                    <div className="flex items-center gap-1.5 text-bronce-antiguo">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-mono text-[11px] uppercase tracking-widest">
                        {hotel.ubicacion}
                      </span>
                    </div>

                    <h3 className="mt-2 font-serif text-3xl font-normal text-papel-algodon transition-colors group-hover:text-bronce-antiguo">
                      {hotel.nombre}
                    </h3>

                    <div className="mt-2 inline-flex items-center gap-2 border border-bronce-antiguo/25 bg-verde-organico/35 px-3 py-1">
                      <Sparkles className="h-3 w-3 text-bronce-antiguo" />
                      <span className="font-sans text-xs font-medium text-papel-algodon/90">
                        {hotel.atmosfera}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 font-sans text-sm font-light leading-relaxed text-papel-algodon/75">
                      {hotel.resumenEditorial}
                    </p>

                    {/* Resumen de las experiencias */}
                    <div className="mt-5 border-t border-bronce-antiguo/20 pt-4">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo/80">
                        {hotel.experiencias.length === 1
                          ? "1 EXPERIENCIA DISPONIBLE:"
                          : `${hotel.experiencias.length} EXPERIENCIAS DISPONIBLES:`}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {hotel.experiencias.map((exp, idx) => (
                          <li
                            key={exp.id}
                            className="flex items-baseline justify-between gap-2 text-xs text-papel-algodon/85"
                          >
                            <span className="truncate font-serif text-sm italic text-papel-algodon">
                              0{idx + 1}. {exp.titulo}
                            </span>
                            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-bronce-antiguo/85">
                              {exp.badgeTipo === "nocturno"
                                ? "Nocturno"
                                : "Diurno"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* CTA de tarjeta */}
                <div className="px-6 pb-6 sm:px-7 sm:pb-7">
                  <Link
                    href={`/hoteles/${hotel.slug}`}
                    className="flex w-full items-center justify-between border border-bronce-antiguo/60 bg-verde-organico px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-papel-algodon transition-all duration-300 group-hover:border-bronce-antiguo group-hover:bg-bronce-antiguo group-hover:text-tinta-archivo"
                  >
                    <span>Ver experiencias y apartar</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

