"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  MapPin,
  Moon,
  Sun,
  ScrollText,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import {
  type Hotel,
  buildExperienceWhatsAppUrl,
  buildConciergeWhatsAppUrl,
} from "@/data/hotels";

interface HotelDetailClientProps {
  hotel: Hotel;
  otherHotels: Hotel[];
}

export default function HotelDetailClient({
  hotel,
  otherHotels,
}: HotelDetailClientProps) {
  return (
    <div className="pb-20 md:pb-0">
      {/* 1. HEADER DE PROPIEDAD CON HERO VISUAL ATMOSFÉRICO */}
      <section className="relative overflow-hidden border-b border-bronce-antiguo/35 bg-tinta-archivo">
        {/* Imagen de fondo atmosférica */}
        <div className="absolute inset-0 z-0">
          <Image
            src={hotel.imagenPrincipal}
            alt={`${hotel.nombre} - ${hotel.atmosfera}`}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tinta-archivo via-tinta-archivo/80 to-tinta-archivo/55" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8">
          {/* Enlace Volver a los 5 destinos */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/#destinos"
              className="inline-flex items-center gap-2 border border-bronce-antiguo/40 bg-tinta-archivo/80 px-4 py-2 font-sans text-xs font-medium uppercase tracking-[0.15em] text-papel-algodon transition-colors hover:border-bronce-antiguo hover:text-bronce-antiguo"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>← Volver a los 5 destinos</span>
            </Link>

            <span className="font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo/90">
              {hotel.coordenadasEditorial}
            </span>
          </div>

          {/* Bloque principal de título y metadatos */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="mt-10 max-w-4xl"
          >
            {/* Badge en JetBrains Mono con folios disponibles */}
            <div className="inline-flex items-center gap-2.5 border border-papel-algodon/25 bg-lacre-borgona px-4 py-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-papel-algodon animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-papel-algodon">
                FOLIO LIMITADO · QUEDAN {hotel.foliosDisponibles} DE{" "}
                {hotel.foliosTotales}
              </span>
            </div>

            {/* Ubicación y atmósfera */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-bronce-antiguo">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest">
                <MapPin className="h-3.5 w-3.5" />
                {hotel.ubicacion}
              </span>
              <span className="text-bronce-antiguo/40">·</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-papel-algodon/90">
                <Sparkles className="h-3.5 w-3.5 text-bronce-antiguo" />
                {hotel.atmosfera}
              </span>
            </div>

            {/* Nombre del hotel en Cormorant Garamond gigante */}
            <h1 className="mt-3 font-serif text-5xl font-normal leading-[1.03] text-papel-algodon sm:text-6xl md:text-7xl lg:text-8xl">
              {hotel.nombre}
            </h1>

            {/* Breve descripción de la atmósfera del lugar */}
            <p className="mt-6 max-w-2xl font-sans text-base font-light leading-relaxed text-papel-algodon/85 sm:text-lg">
              {hotel.resumenEditorial}
            </p>
          </motion.div>

          {/* Banner horizontal explicando el proceso de invitación, firma en recepción y beneficio 2028 */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
            className="mt-10 flex flex-col items-start justify-between gap-4 border border-bronce-antiguo/55 bg-verde-organico/55 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:px-7"
          >
            <div className="flex items-start gap-3.5 sm:items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-bronce-antiguo/60 bg-tinta-archivo text-bronce-antiguo">
                <ScrollText className="h-4 w-4" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
                  {hotel.experiencias.length === 1
                    ? "PROCESO INCLUIDO EN ESTA EXPERIENCIA"
                    : "PROCESO INCLUIDO EN AMBAS EXPERIENCIAS"}
                </p>
                <p className="mt-0.5 font-sans text-sm text-papel-algodon">
                  Al confirmar su reserva reciben un{" "}
                  <strong className="font-semibold text-papel-algodon">
                    link con su invitación personalizada
                  </strong>
                  . Al llegar a recepción firman su{" "}
                  <strong className="font-semibold text-papel-algodon">
                    hoja personalizada
                  </strong>
                  ; el hotel la guarda para el próximo año y, si regresan en
                  febrero 2028, reciben{" "}
                  <strong className="font-semibold text-bronce-antiguo">
                    25% de tarifa preferencial y brindis de bienvenida
                  </strong>
                  .
                </p>
              </div>
            </div>

            <div className="shrink-0 border border-bronce-antiguo/40 bg-tinta-archivo/80 px-3.5 py-2 font-mono text-[11px] uppercase tracking-widest text-papel-algodon">
              CITA APARTADA: FEB 2028
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. LAS 2 EXPERIENCIAS ÚNICAS DEL HOTEL (TARJETAS DE VENTA DE ALTO IMPACTO) */}
      <section
        id="experiencias-hotel"
        className="border-b border-bronce-antiguo/35 bg-papel-algodon text-tinta-archivo paper-texture-light py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 border-b border-tinta-archivo/15 pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-lacre-borgona">
                SELECCIÓN DE EXPERIENCIA · 12 AL 14 DE FEBRERO 2027
              </p>
              <h2 className="mt-2 font-serif text-3xl font-normal text-tinta-archivo sm:text-5xl">
                {hotel.experiencias.length === 1
                  ? "Una experiencia diseñada para detener el tiempo en "
                  : "Dos maneras de detener el tiempo en "}
                <span className="italic">{hotel.nombre}</span>
              </h2>
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-tinta-archivo/65">
              CÓDIGO DE ARCHIVO: {hotel.codigoArchivo}
            </p>
          </div>

          {/* Bloques amplios y detallados */}
          <div
            className={`grid grid-cols-1 gap-10 ${
              hotel.experiencias.length === 1
                ? "mx-auto max-w-3xl"
                : "lg:grid-cols-2"
            }`}
          >
            {hotel.experiencias.map((experiencia, index) => {
              const whatsappUrl = buildExperienceWhatsAppUrl(
                hotel.nombre,
                experiencia.titulo
              );

              return (
                <motion.article
                  key={experiencia.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.12 }}
                  className="flex flex-col justify-between border border-bronce-antiguo/75 bg-papel-algodon shadow-[0_20px_50px_rgba(22,24,23,0.08)]"
                >
                  <div>
                    {/* Imagen curada superior */}
                    <div className="relative h-64 w-full overflow-hidden border-b border-bronce-antiguo/50 sm:h-72">
                      <Image
                        src={experiencia.imagen}
                        alt={`${experiencia.titulo} en ${hotel.nombre}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-tinta-archivo/85 via-tinta-archivo/20 to-transparent" />

                      {/* Etiqueta de enfoque (NOCTURNO / ÍNTIMO o DIURNO / SENSORIAL) */}
                      <div className="absolute left-5 top-5 inline-flex items-center gap-2 border border-bronce-antiguo/70 bg-tinta-archivo/90 px-3.5 py-1.5 text-papel-algodon">
                        {experiencia.badgeTipo === "nocturno" ? (
                          <Moon className="h-3.5 w-3.5 text-bronce-antiguo" />
                        ) : (
                          <Sun className="h-3.5 w-3.5 text-bronce-antiguo" />
                        )}
                        <span className="font-mono text-[11px] uppercase tracking-widest">
                          {experiencia.enfoque.toUpperCase()}
                        </span>
                      </div>

                      {/* Numeración de Opción */}
                      <div className="absolute bottom-4 left-5 right-5 flex items-baseline justify-between">
                        <span className="font-mono text-xs uppercase tracking-widest text-papel-algodon/85">
                          OPCIÓN 0{index + 1} · FOLIO 2027/28
                        </span>
                        <span className="border border-lacre-borgona bg-lacre-borgona px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon">
                          QUEDAN {hotel.foliosDisponibles} FOLIOS
                        </span>
                      </div>
                    </div>

                    {/* Contenido editorial de la tarjeta */}
                    <div className="p-7 sm:p-10">
                      {/* Título de la experiencia en Cormorant Garamond */}
                      <h3 className="font-serif text-3xl font-medium leading-tight text-tinta-archivo sm:text-4xl">
                        {experiencia.titulo}
                      </h3>

                      {/* Descripción emotiva completa */}
                      <p className="mt-4 font-sans text-base leading-relaxed text-tinta-archivo/85">
                        {experiencia.descripcionEmotiva}
                      </p>

                      {/* Lista elegante con íconos minimalistas de todo lo que incluye */}
                      <div className="mt-8 border-t border-tinta-archivo/15 pt-6">
                        <p className="font-mono text-xs uppercase tracking-widest text-verde-organico">
                          QUÉ INCLUYE ESTA EXPERIENCIA:
                        </p>

                        <ul className="mt-4 space-y-3">
                          {experiencia.incluyeLista.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-3 font-sans text-sm leading-relaxed text-tinta-archivo/90"
                            >
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-bronce-antiguo bg-tinta-archivo text-bronce-antiguo">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        <p className="mt-4 border-l-2 border-bronce-antiguo pl-3 font-sans text-xs italic text-tinta-archivo/70">
                          Resumen: {experiencia.incluyeTekstCompleto}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pie de tarjeta: Beneficio + Botón Principal de Conversión WhatsApp */}
                  <div className="border-t border-bronce-antiguo/60 bg-tinta-archivo/[0.03] p-7 sm:px-10 sm:py-8">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-tinta-archivo/70">
                        LINK DE INVITACIÓN ENTREGADO AL CONFIRMAR
                      </span>
                      <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-lacre-borgona">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span>+ BENEFICIO 2028 AL REGRESAR</span>
                      </div>
                    </div>

                    {/* Botón Principal de Conversión (WhatsApp Personalizado) */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 flex w-full items-center justify-center gap-3 border border-verde-organico bg-verde-organico px-6 py-4 text-center font-sans text-xs font-semibold uppercase tracking-[0.16em] text-papel-algodon transition-all duration-300 hover:border-bronce-antiguo hover:bg-bronce-antiguo hover:text-tinta-archivo sm:text-sm"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" />
                      <span>Apartar esta experiencia por WhatsApp</span>
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. EXPLORADOR DE OTRAS PROPIEDADES (LOS OTROS 4 HOTELES) */}
      <section className="border-b border-bronce-antiguo/30 bg-tinta-archivo paper-texture-dark py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-bronce-antiguo/25 pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-bronce-antiguo">
                COMPARAR OTRA ATMÓSFERA
              </p>
              <h2 className="mt-2 font-serif text-3xl font-normal text-papel-algodon sm:text-4xl">
                Explorar las otras{" "}
                <span className="italic text-bronce-antiguo">
                  4 propiedades
                </span>
              </h2>
            </div>

            <Link
              href="/#destinos"
              className="font-mono text-xs uppercase tracking-widest text-papel-algodon/80 transition-colors hover:text-bronce-antiguo"
            >
              VER CUADRÍCULA COMPLETA →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {otherHotels.map((other) => (
              <Link
                key={other.slug}
                href={`/hoteles/${other.slug}`}
                className="group flex flex-col justify-between border border-bronce-antiguo/30 bg-tinta-archivo transition-all duration-300 hover:-translate-y-1 hover:border-bronce-antiguo"
              >
                <div>
                  <div className="relative h-36 w-full overflow-hidden border-b border-bronce-antiguo/25">
                    <Image
                      src={other.imagenPrincipal}
                      alt={other.nombre}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tinta-archivo via-transparent to-transparent" />
                    <span className="absolute left-2.5 top-2.5 bg-lacre-borgona px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon">
                      {other.foliosDisponibles}/20 FOLIOS
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                      {other.ubicacion}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-normal text-papel-algodon group-hover:text-bronce-antiguo">
                      {other.nombre}
                    </h3>
                    <p className="mt-1 font-sans text-xs text-papel-algodon/70">
                      {other.atmosfera}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-bronce-antiguo/20 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                  <span>Explorar destino</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BARRA STICKY INFERIOR EN MÓVIL */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-bronce-antiguo/60 bg-tinta-archivo/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <a
            href="#experiencias-hotel"
            className="flex-1 border border-bronce-antiguo/50 bg-papel-algodon px-3 py-2.5 text-center font-sans text-xs font-semibold uppercase tracking-wider text-tinta-archivo"
          >
            Elegir experiencia
          </a>
          <a
            href={buildConciergeWhatsAppUrl(hotel.nombre)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 border border-verde-organico bg-verde-organico px-3 py-2.5 text-center font-sans text-xs font-semibold uppercase tracking-wider text-papel-algodon"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
}
