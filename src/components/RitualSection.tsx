"use client";

import { motion } from "framer-motion";

const RITUAL_STEPS = [
  {
    numero: "01",
    momento: "AL CONFIRMAR TU RESERVA",
    titulo: "Link con tu Invitación",
    subtitulo: "Reserva confirmada",
    descripcion:
      "En cuanto quede confirmada su reserva, les daremos un link con su invitación personalizada para ese día, lista para compartir y sorprender a tu pareja.",
    notaArchivo: "ENLACE DE INVITACIÓN PERSONALIZADA PARA ESE DÍA",
  },
  {
    numero: "02",
    momento: "EL DÍA DE SU RESERVA · 12–14 FEB 2027",
    titulo: "Firma en Recepción",
    subtitulo: "Al llegar al hotel",
    descripcion:
      "Cuando lleguen el día de su reserva, en recepción firmarán juntos su hoja personalizada dejando pactada su cita para el próximo año.",
    notaArchivo: "EL HOTEL GUARDARÁ LAS HOJAS FIRMADAS PARA EL PRÓXIMO AÑO",
  },
  {
    numero: "03",
    momento: "FEBRERO 2028",
    titulo: "El Beneficio al Regresar",
    subtitulo: "Su reencuentro en 2028",
    descripcion:
      "El hotel resguarda su hoja para el próximo año y, si regresan en febrero de 2028, se les otorgará el beneficio de 25% de tarifa preferencial y brindis de bienvenida.",
    notaArchivo: "BENEFICIO EXCLUSIVO DE REGRESO · CITA APARTADA: FEB 2028",
  },
];

export default function RitualSection() {
  return (
    <section
      id="ritual"
      className="relative border-b border-bronce-antiguo/40 bg-papel-algodon text-tinta-archivo paper-texture-light py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabecera editorial */}
        <div className="mb-14 flex flex-col justify-between gap-6 border-b border-tinta-archivo/15 pb-10 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-lacre-borgona">
              EL PROCESO · 2027 — 2028
            </p>
            <h2 className="mt-3 font-serif text-4xl font-normal leading-tight text-tinta-archivo sm:text-5xl">
              El Ritual en <span className="italic">3 Actos</span>
            </h2>
          </div>

          <p className="max-w-xl font-sans text-sm leading-relaxed text-tinta-archivo/80 sm:text-base">
            Casi todas las historias del 14 de febrero miran con nostalgia hacia
            atrás. Esta edición está diseñada para mirar hacia adelante: vivir
            un fin de semana irrepetible hoy y dejar por escrito el tiempo que
            se deben para el próximo año.
          </p>
        </div>

        {/* 3 Columnas Numeradas con líneas finas de 1px */}
        <div className="grid grid-cols-1 border border-bronce-antiguo/60 bg-papel-algodon lg:grid-cols-3 lg:divide-x lg:divide-bronce-antiguo/60">
          {RITUAL_STEPS.map((step, index) => (
            <motion.article
              key={step.numero}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className="group relative flex flex-col justify-between border-b border-bronce-antiguo/60 p-8 transition-colors duration-300 hover:bg-tinta-archivo/[0.025] sm:p-10 lg:border-b-0"
            >
              <div>
                {/* Fila superior: Número en Cormorant + Etiqueta de tiempo */}
                <div className="flex items-baseline justify-between border-b border-tinta-archivo/10 pb-6">
                  <span className="font-serif text-5xl font-normal italic text-bronce-antiguo sm:text-6xl">
                    {step.numero}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-verde-organico">
                    {step.momento}
                  </span>
                </div>

                {/* Título y subtítulo */}
                <div className="mt-7">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-lacre-borgona">
                    ACTO {step.numero} · {step.subtitulo.toUpperCase()}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl font-medium text-tinta-archivo sm:text-3xl">
                    {step.titulo}
                  </h3>
                  <p className="mt-4 font-sans text-base leading-relaxed text-tinta-archivo/85">
                    {step.numero === "03" ? (
                      <>
                        El hotel resguarda su hoja para el próximo año y, si
                        regresan en febrero de 2028, se les otorgará el
                        beneficio de{" "}
                        <strong className="font-semibold text-verde-organico">
                          25% de tarifa preferencial y brindis de bienvenida
                        </strong>
                        .
                      </>
                    ) : (
                      step.descripcion
                    )}
                  </p>
                </div>
              </div>

              {/* Pie técnico de relojería */}
              <div className="mt-10 border-t border-bronce-antiguo/40 pt-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-tinta-archivo/60">
                  {step.notaArchivo}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
