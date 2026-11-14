"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircle } from "lucide-react";
import {
  FAQ_ITEMS,
  HOTELS,
  WHATSAPP_DISPLAY,
  buildConciergeWhatsAppUrl,
} from "@/data/hotels";

export default function FaqAndFooter() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* Sección de Preguntas Frecuentes */}
      <section
        id="preguntas"
        className="border-b border-bronce-antiguo/40 bg-papel-algodon text-tinta-archivo paper-texture-light py-20 sm:py-28"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-lacre-borgona">
              CLARIDAD TOTAL · SIN LETRAS PEQUEÑAS
            </span>
            <h2 className="mt-3 font-serif text-4xl font-normal text-tinta-archivo sm:text-5xl">
              Preguntas <span className="italic">Frecuentes</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-sans text-sm leading-relaxed text-tinta-archivo/75 sm:text-base">
              Todo lo que necesitan saber sobre su reserva de febrero 2027, el
              link de invitación personalizada, la firma de su hoja en recepción
              y el beneficio al regresar en 2028.
            </p>
          </div>

          {/* Acordeón limpio con líneas de 1px */}
          <div className="mt-12 divide-y divide-bronce-antiguo/50 border-y border-bronce-antiguo/60">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={item.pregunta} className="py-6">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-6 text-left focus:outline-none"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs uppercase tracking-widest text-bronce-antiguo">
                        0{idx + 1}
                      </span>
                      <span className="font-serif text-xl font-medium text-tinta-archivo sm:text-2xl">
                        {item.pregunta}
                      </span>
                    </div>
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center border border-bronce-antiguo/60 text-tinta-archivo transition-colors hover:bg-tinta-archivo hover:text-papel-algodon">
                      {isOpen ? (
                        <Minus className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 pl-8 pr-4 font-sans text-sm leading-relaxed text-tinta-archivo/80 sm:text-base">
                          {item.respuesta}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Bloque de asistencia directa con Concierge */}
          <div className="mt-12 flex flex-col items-center justify-between gap-6 border border-bronce-antiguo/60 bg-tinta-archivo p-7 text-papel-algodon sm:flex-row sm:p-9">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
                CONCIERGE DEDICADO · GRUPO ORGÁNICO
              </p>
              <h3 className="mt-1 font-serif text-2xl font-normal">
                ¿Deseas personalizar tu estancia o consultar folios en tiempo
                real?
              </h3>
              <p className="mt-1 font-sans text-xs text-papel-algodon/75 sm:text-sm">
                Atención directa por WhatsApp en el {WHATSAPP_DISPLAY}
              </p>
            </div>

            <a
              href={buildConciergeWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full shrink-0 items-center justify-center gap-2.5 border border-bronce-antiguo bg-verde-organico px-6 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-papel-algodon transition-colors duration-300 hover:bg-bronce-antiguo hover:text-tinta-archivo sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Hablar con Concierge</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer Editorial */}
      <footer className="bg-tinta-archivo text-papel-algodon paper-texture-dark">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 border-b border-bronce-antiguo/25 pb-12 lg:grid-cols-12">
            {/* Columna de Marca */}
            <div className="lg:col-span-5">
              <p className="font-serif text-xl tracking-[0.16em] text-papel-algodon">
                GRUPO ORGÁNICO <span className="text-bronce-antiguo">·</span>{" "}
                <span className="italic">HOTELES BOUTIQUE</span>
              </p>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-bronce-antiguo">
                CAMPAÑA OFICIAL · EL TIEMPO QUE NOS DEBEMOS (2027 — 2028)
              </p>
              <p className="mt-4 max-w-md font-sans text-sm font-light leading-relaxed text-papel-algodon/70">
                Hospitalidad silenciosa y experiencias de autor. Cinco
                propiedades diseñadas para detener el reloj entre el 12 y el 14
                de febrero de 2027 y dejar pactado su regreso para febrero de
                2028.
              </p>
            </div>

            {/* Columna de los 5 Destinos */}
            <div className="lg:col-span-4">
              <p className="font-mono text-xs uppercase tracking-widest text-bronce-antiguo">
                LOS 5 DESTINOS PARTICIPANTES
              </p>
              <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {HOTELS.map((hotel) => (
                  <li key={hotel.slug}>
                    <Link
                      href={`/hoteles/${hotel.slug}`}
                      className="inline-flex items-center gap-2 font-sans text-xs text-papel-algodon/75 transition-colors hover:text-bronce-antiguo"
                    >
                      <span className="h-1 w-1 rounded-full bg-bronce-antiguo/70" />
                      <span>{hotel.nombre}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna de Registro y Contacto */}
            <div className="lg:col-span-3">
              <p className="font-mono text-xs uppercase tracking-widest text-bronce-antiguo">
                RESERVACIONES & FOLIOS
              </p>
              <div className="mt-4 space-y-2 font-mono text-xs tracking-wider text-papel-algodon/80">
                <p>FECHAS: 12 – 14 FEB 2027</p>
                <p>CUPO: 20 FOLIOS POR PROPIEDAD</p>
                <p>CITA APARTADA: FEB 2028</p>
                <p className="pt-2 text-bronce-antiguo">
                  WHATSAPP: {WHATSAPP_DISPLAY}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-center font-mono text-[11px] uppercase tracking-widest text-papel-algodon/50 sm:flex-row sm:text-left">
            <p>
              © {new Date().getFullYear()} GRUPO ORGÁNICO HOTELES BOUTIQUE.
              TODOS LOS DERECHOS RESERVADOS.
            </p>
            <p>14.02.2027 ————————— 14.02.2028</p>
          </div>
        </div>
      </footer>
    </>
  );
}
