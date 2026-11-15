"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarPlus,
  Compass,
  Lock,
  Luggage,
  MapPin,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Thermometer,
  ExternalLink,
} from "lucide-react";
import type { Experience, Hotel, PackingHints } from "@/data/hotels";
import type { PassData } from "@/lib/passCodec";
import { buildGoogleCalendarEvents } from "@/lib/calendarIcs";
import { describeIsoDate, type CampaignDateDay } from "@/lib/passDates";

interface DigitalPassViewProps {
  pass: PassData;
  packingHints: PackingHints;
  hotel?: Hotel | null;
  experiencia?: Experience | null;
  /** En vista previa del generador permite forzar el estado abierto/cerrado externamente */
  controlledStep?: "sealed" | "opened";
  onStepChange?: (step: "sealed" | "opened") => void;
  isPreview?: boolean;
  /** Identificador en Neon Postgres para registrar apertura del sello */
  passSlug?: string;
  /** Texto formateado cuando el destino secreto tiene fecha de revelación automática */
  revealAtLabel?: string | null;
}

function SelectedDatesRow({
  dates,
  compact = false,
}: {
  dates: CampaignDateDay[];
  compact?: boolean;
}) {
  if (dates.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap ${compact ? "mt-2.5 gap-1.5" : "mt-3 gap-2"}`}
    >
      {dates.map((day) => (
        <span
          key={day.iso}
          className={`inline-flex items-center border border-bronce-antiguo/45 bg-verde-organico/35 font-mono text-[10px] uppercase tracking-widest text-papel-algodon/90 ${
            compact ? "gap-1 px-2 py-0.5" : "gap-1.5 px-2.5 py-1"
          }`}
        >
          <span className="text-bronce-antiguo">{day.weekdayShort}</span>
          <span>
            {day.dayNumber} {day.monthShort}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function DigitalPassView({
  pass,
  packingHints,
  hotel = null,
  experiencia = null,
  controlledStep,
  onStepChange,
  isPreview = false,
  passSlug,
  revealAtLabel = null,
}: DigitalPassViewProps) {
  const [internalStep, setInternalStep] = useState<"sealed" | "opened">(
    "sealed"
  );
  const openTrackedRef = useRef(false);

  const currentStep = controlledStep ?? internalStep;
  const setStep = (next: "sealed" | "opened") => {
    if (next === "opened" && !isPreview && passSlug && !openTrackedRef.current) {
      openTrackedRef.current = true;
      void fetch(`/api/passes/${encodeURIComponent(passSlug)}/open`, {
        method: "POST",
      }).catch(() => {
        // Ignorar errores silenciosamente para no afectar la experiencia del invitado
      });
    }

    if (onStepChange) {
      onStepChange(next);
    } else {
      setInternalStep(next);
    }
  };

  const destinatarioDisplay = pass.destinatario.trim() || "Mi Compañera/o de Viaje";
  const remitenteDisplay = pass.remitente.trim() || "Alguien Especial";
  const folioDisplay = pass.folio.trim() || "GO-2027-014";
  const fechaDisplay =
    pass.fechaLlegada.trim() || "Viernes 12 de Febrero 2027 · 15:00 hrs";
  const selectedDateBadges: CampaignDateDay[] = (
    pass.fechasSeleccionadas ?? []
  )
    .map((iso) => describeIsoDate(iso))
    .filter((item): item is CampaignDateDay => item !== null);
  const hasMultipleDates = selectedDateBadges.length > 1;
  const dedicatoriaDisplay =
    pass.dedicatoria.trim() ||
    "Casi todos celebran lo que ya fue; yo quiero apartar desde hoy el tiempo que aún nos debemos.";

  const googleCalendarEvents = buildGoogleCalendarEvents(
    {
      ...pass,
      folio: folioDisplay,
      remitente: remitenteDisplay,
      destinatario: destinatarioDisplay,
      fechaLlegada: fechaDisplay,
      dedicatoria: dedicatoriaDisplay,
    },
    packingHints,
    hotel,
    experiencia
  );

  return (
    <div
      className={`relative w-full bg-tinta-archivo text-papel-algodon paper-texture-dark ${
        isPreview
          ? "min-h-[640px] flex flex-col justify-between"
          : "min-h-screen flex flex-col justify-between"
      }`}
    >
      {/* Líneas sutiles de relojería de fondo */}
      <div
        className="pointer-events-none absolute inset-0 mx-auto max-w-5xl border-x border-bronce-antiguo/10"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {currentStep === "sealed" ? (
          <motion.section
            key="sealed-envelope"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.03,
              transition: { duration: 0.45, ease: "easeInOut" },
            }}
            className={`relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-between text-center ${
              isPreview ? "px-5 py-9" : "px-6 py-12 sm:py-16"
            }`}
          >
            {/* Cabecera del sobre */}
            <div className="flex w-full flex-col items-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-bronce-antiguo/80">
                GRUPO ORGÁNICO HOTELES BOUTIQUE
              </span>
              <div className="mt-3 border border-bronce-antiguo/35 bg-tinta-archivo/90 px-4 py-1.5">
                <span className="font-mono text-[11px] uppercase tracking-widest text-papel-algodon/90">
                  FOLIO: {folioDisplay}
                </span>
              </div>

              {/* Línea de tiempo 14.02.2027 — 14.02.2028 */}
              <div className="mt-7 flex w-full max-w-sm items-center justify-center gap-3">
                <span className="font-mono text-[11px] tracking-widest text-bronce-antiguo">
                  14.02.2027
                </span>
                <div className="flex flex-1 items-center gap-1.5">
                  <span className="h-1 w-1 rotate-45 bg-bronce-antiguo" />
                  <div className="h-px flex-1 bg-bronce-antiguo/55" />
                  <span className="h-1 w-1 rotate-45 bg-bronce-antiguo" />
                </div>
                <span className="font-mono text-[11px] tracking-widest text-bronce-antiguo">
                  14.02.2028
                </span>
              </div>
            </div>

            {/* Destinatario + Sello circular borgoña GO */}
            <div className="my-8 flex flex-col items-center">
              <h1
                className={`font-serif font-normal italic leading-tight text-papel-algodon ${
                  isPreview ? "text-3xl sm:text-4xl" : "text-4xl sm:text-6xl"
                }`}
              >
                Para {destinatarioDisplay}
              </h1>

              <p className="mt-2 font-sans text-xs font-light tracking-wide text-papel-algodon/70 sm:text-sm">
                Una invitación apartada por{" "}
                <span className="font-medium text-bronce-antiguo">
                  {remitenteDisplay}
                </span>
              </p>

              {/* Sello circular borgoña con relieve e interacción táctil */}
              <div className="mt-9 flex flex-col items-center">
                <motion.button
                  type="button"
                  onClick={() => setStep("opened")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label="Toca el sello para abrir tu invitación"
                  className="group relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-bronce-antiguo sm:h-36 sm:w-36"
                >
                  {/* Halo suave animado */}
                  <span
                    className="absolute -inset-2.5 rounded-full border border-bronce-antiguo/30 animate-pulse"
                    aria-hidden="true"
                  />

                  {/* Cuerpo del sello borgoña con efecto de relieve */}
                  <span
                    className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-[#471916] shadow-[0_14px_35px_rgba(0,0,0,0.65),inset_0_3px_8px_rgba(255,255,255,0.22),inset_0_-6px_12px_rgba(30,8,7,0.75)] transition-shadow duration-300 group-hover:shadow-[0_16px_42px_rgba(184,147,82,0.28),inset_0_3px_10px_rgba(255,255,255,0.28)]"
                    style={{
                      background:
                        "radial-gradient(circle at 32% 30%, #8e3c37 0%, #6E2C28 55%, #461917 100%)",
                    }}
                  >
                    {/* Anillo interior grabado */}
                    <span className="flex h-[82%] w-[82%] items-center justify-center rounded-full border border-bronce-antiguo/45 bg-black/10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.55)]">
                      <span className="font-serif text-4xl font-semibold tracking-[0.14em] text-papel-algodon/95 drop-shadow-[0_2px_2px_rgba(0,0,0,0.65)] sm:text-[2.6rem]">
                        GO
                      </span>
                    </span>
                  </span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep("opened")}
                  className="mt-6 border border-bronce-antiguo/40 bg-tinta-archivo/80 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-bronce-antiguo transition-colors hover:border-bronce-antiguo hover:bg-bronce-antiguo hover:text-tinta-archivo"
                >
                  Toca el sello para abrir tu invitación
                </button>
              </div>
            </div>

            {/* Nota inferior discreta */}
            <p className="font-mono text-[10px] uppercase tracking-widest text-papel-algodon/45">
              12 – 14 DE FEBRERO 2027 · EDICIÓN LIMITADA
            </p>
          </motion.section>
        ) : (
          <motion.section
            key="opened-certificate"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className={`relative z-10 mx-auto w-full max-w-3xl flex-1 ${
              isPreview ? "px-3 py-5" : "px-4 py-8 sm:px-6 sm:py-14"
            }`}
          >
            {/* ESTADO 2: INVITACIÓN DIGITAL EN TONO EDITORIAL CÁLIDO */}
            <article className="border border-bronce-antiguo/80 bg-papel-algodon p-1.5 text-tinta-archivo shadow-[0_30px_70px_rgba(0,0,0,0.55)] paper-texture-light">
              <div
                className={`border border-bronce-antiguo/45 ${
                  isPreview ? "p-4" : "p-5 sm:p-10"
                }`}
              >
                {/* Encabezado notarial */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-tinta-archivo/15 pb-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-lacre-borgona sm:text-[11px]">
                    EL TIEMPO QUE NOS DEBEMOS · CERTIFICADO DE CITA APARTADA
                  </p>
                  <span className="border border-bronce-antiguo/60 bg-tinta-archivo px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                    FOLIO: {folioDisplay}
                  </span>
                </div>

                {/* Bloque de nombres */}
                <div
                  className={`mt-6 grid grid-cols-1 border-b border-tinta-archivo/10 ${
                    isPreview
                      ? "gap-3 pb-5"
                      : "gap-4 pb-7 sm:mt-7 sm:grid-cols-2"
                  }`}
                >
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-tinta-archivo/55">
                      EXTENDIDO PARA
                    </span>
                    <h1
                      className={`mt-1 font-serif font-medium text-tinta-archivo ${
                        isPreview ? "text-2xl" : "text-3xl sm:text-4xl"
                      }`}
                    >
                      {destinatarioDisplay}
                    </h1>
                  </div>
                  <div className={isPreview ? "" : "sm:text-right"}>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-tinta-archivo/55">
                      APARTADO POR
                    </span>
                    <p
                      className={`mt-1 font-serif italic text-verde-organico ${
                        isPreview ? "text-xl" : "text-2xl sm:text-3xl"
                      }`}
                    >
                      {remitenteDisplay}
                    </p>
                  </div>
                </div>

                {/* Dedicatoria personal en Cormorant Garamond con comillas editoriales */}
                <div
                  className={`relative border-l-2 border-bronce-antiguo bg-tinta-archivo/[0.03] ${
                    isPreview
                      ? "my-5 px-4 py-4"
                      : "my-7 px-5 py-5 sm:px-7 sm:py-6"
                  }`}
                >
                  <span
                    className="pointer-events-none select-none font-serif text-5xl leading-none text-bronce-antiguo/45"
                    aria-hidden="true"
                  >
                    “
                  </span>
                  <blockquote
                    className={`-mt-3 font-serif italic leading-relaxed text-tinta-archivo ${
                      isPreview ? "text-lg" : "text-xl sm:text-2xl"
                    }`}
                  >
                    {dedicatoriaDisplay}
                  </blockquote>
                  <div className="mt-3 flex justify-end">
                    <span
                      className="pointer-events-none select-none font-serif text-4xl leading-none text-bronce-antiguo/45"
                      aria-hidden="true"
                    >
                      ”
                    </span>
                  </div>
                </div>

                {/* Manifiesto breve actualizado */}
                <p className="font-sans text-sm leading-relaxed text-tinta-archivo/85">
                  Este 14 de febrero no se trata de celebrar lo que ya pasó, sino
                  de apartar el tiempo que está por venir. Al llegar el día de su
                  reserva, firmarán juntos en recepción su{" "}
                  <strong className="font-semibold text-verde-organico">
                    hoja personalizada
                  </strong>{" "}
                  para volver exactamente dentro de un año, en{" "}
                  <strong className="font-semibold text-tinta-archivo">
                    febrero de 2028
                  </strong>
                  , con{" "}
                  <strong className="font-semibold text-tinta-archivo">
                    25% de tarifa preferencial y brindis de bienvenida
                  </strong>
                  .
                </p>

                {/* BLOQUE DINÁMICO DE DESTINO (Normal vs. Destino Secreto) */}
                <div className="mt-8 border border-bronce-antiguo/60 bg-tinta-archivo text-papel-algodon">
                  {pass.destinoSecreto || !hotel || !experiencia ? (
                    <div className={isPreview ? "p-4" : "p-6 sm:p-8"}>
                      {/* Sello Destino Confidencial */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bronce-antiguo/30 pb-5">
                        <span className="inline-flex items-center gap-2 border border-lacre-borgona bg-lacre-borgona px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon sm:text-[11px]">
                          <Lock className="h-3.5 w-3.5" />
                          DESTINO CONFIDENCIAL · REVELACIÓN AL VIAJAR
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                          {revealAtLabel
                            ? `REVELACIÓN · ${revealAtLabel}`
                            : "MODO SORPRESA ACTIVO"}
                        </span>
                      </div>

                      {/* Fecha(s) y hora en que deben estar listos */}
                      <div className="mt-5 border-b border-bronce-antiguo/20 pb-5">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                          {hasMultipleDates
                            ? "FECHAS Y HORA EN QUE DEBEN ESTAR LISTOS"
                            : "FECHA Y HORA EN QUE DEBEN ESTAR LISTOS"}
                        </p>
                        <p
                          className={`mt-1 font-serif font-normal text-papel-algodon ${
                            isPreview ? "text-xl" : "text-2xl sm:text-3xl"
                          }`}
                        >
                          {fechaDisplay}
                        </p>
                        <SelectedDatesRow dates={selectedDateBadges} />
                      </div>

                      {/* Pistas de Equipaje (Sin revelar el lugar) */}
                      <div className="mt-6">
                        <p className="font-mono text-xs uppercase tracking-widest text-bronce-antiguo">
                          Pistas de Equipaje (Sin revelar el lugar)
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-3.5">
                          <div className="flex items-start gap-3.5 border border-bronce-antiguo/25 bg-verde-organico/25 p-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-bronce-antiguo/50 bg-tinta-archivo text-bronce-antiguo">
                              <Thermometer className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                                CLIMA ESPERADO
                              </p>
                              <p className="mt-0.5 font-sans text-sm text-papel-algodon/90">
                                {packingHints.clima}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3.5 border border-bronce-antiguo/25 bg-verde-organico/25 p-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-bronce-antiguo/50 bg-tinta-archivo text-bronce-antiguo">
                              <Luggage className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                                QUÉ EMPACAR
                              </p>
                              <p className="mt-0.5 font-sans text-sm text-papel-algodon/90">
                                {packingHints.equipaje}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3.5 border border-bronce-antiguo/25 bg-verde-organico/25 p-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-bronce-antiguo/50 bg-tinta-archivo text-bronce-antiguo">
                              <Compass className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                                ATMÓSFERA DEL DESTINO
                              </p>
                              <p className="mt-0.5 font-sans text-sm text-papel-algodon/90">
                                {packingHints.vibe}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Fotografía del hotel */}
                      <div
                        className={`relative w-full overflow-hidden border-b border-bronce-antiguo/40 ${
                          isPreview ? "h-44" : "h-56 sm:h-64"
                        }`}
                      >
                        <Image
                          src={hotel.imagenPrincipal}
                          alt={`${hotel.nombre} - ${hotel.atmosfera}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 720px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-tinta-archivo via-tinta-archivo/35 to-transparent" />
                        <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                            <MapPin className="h-3.5 w-3.5" />
                            {hotel.ubicacion}
                          </span>
                          <span className="border border-bronce-antiguo/40 bg-tinta-archivo/85 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon/85">
                            {hotel.codigoArchivo}
                          </span>
                        </div>
                      </div>

                      <div className={isPreview ? "p-4" : "p-6 sm:p-8"}>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                          DESTINO CONFIRMADO · GRUPO ORGÁNICO
                        </p>
                        <h2
                          className={`mt-1 font-serif font-normal text-papel-algodon ${
                            isPreview ? "text-3xl" : "text-4xl sm:text-5xl"
                          }`}
                        >
                          {hotel.nombre}
                        </h2>

                        {/* Experiencia reservada */}
                        <div className="mt-5 border border-bronce-antiguo/30 bg-verde-organico/35 p-4 sm:p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                              EXPERIENCIA RESERVADA
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon/85">
                              {experiencia.badgeTipo === "nocturno" ? (
                                <Moon className="h-3 w-3 text-bronce-antiguo" />
                              ) : (
                                <Sun className="h-3 w-3 text-bronce-antiguo" />
                              )}
                              {experiencia.enfoque}
                            </span>
                          </div>
                          <h3 className="mt-1.5 font-serif text-2xl italic text-papel-algodon">
                            {experiencia.titulo}
                          </h3>
                          <p className="mt-2 font-sans text-xs leading-relaxed text-papel-algodon/80 sm:text-sm">
                            {experiencia.descripcionEmotiva}
                          </p>
                        </div>

                        {/* Fecha y Ubicación */}
                        <div
                          className={`mt-5 grid grid-cols-1 border-t border-bronce-antiguo/20 ${
                            isPreview
                              ? "gap-3 pt-4"
                              : "gap-4 pt-5 sm:grid-cols-2"
                          }`}
                        >
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                              {hasMultipleDates
                                ? "FECHAS Y HORA DE ESTANCIA / LLEGADA"
                                : "FECHA Y HORA DE LLEGADA"}
                            </p>
                            <p className="mt-1 font-sans text-sm font-medium text-papel-algodon">
                              {fechaDisplay}
                            </p>
                            <SelectedDatesRow
                              dates={selectedDateBadges}
                              compact
                            />
                          </div>
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                              DIRECCIÓN DEL HOTEL
                            </p>
                            <p className="mt-1 font-sans text-xs leading-relaxed text-papel-algodon/80">
                              {hotel.direccionExacta}
                            </p>
                          </div>
                        </div>

                        {/* Botón directo Cómo llegar (Google Maps) */}
                        <a
                          href={hotel.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex w-full items-center justify-center gap-2.5 border border-bronce-antiguo bg-bronce-antiguo px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-tinta-archivo transition-colors hover:bg-papel-algodon"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Cómo llegar (Google Maps)</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* ESTADO 3: ACCIONES DEL INVITADO (Pie del certificado) */}
                <div className="mt-7 border-t border-tinta-archivo/15 pt-6">
                  <div
                    className={`flex flex-col gap-3 ${
                      isPreview || googleCalendarEvents.length > 1
                        ? ""
                        : "sm:flex-row sm:items-center sm:justify-between"
                    }`}
                  >
                    <div className="flex flex-1 flex-wrap gap-2">
                      {googleCalendarEvents.map((ev, idx) => (
                        <a
                          key={ev.url}
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-2.5 border border-verde-organico bg-verde-organico px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-papel-algodon transition-colors hover:border-bronce-antiguo hover:bg-tinta-archivo"
                        >
                          <CalendarPlus className="h-4 w-4 shrink-0 text-bronce-antiguo" />
                          <span>
                            {googleCalendarEvents.length > 1 && ev.label
                              ? `Google Calendar (${ev.label})`
                              : "Agregar a Google Calendar"}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-bronce-antiguo/80" />
                          {idx === 0 && (
                            <span className="sr-only">
                              Abre Google Calendar para guardar este evento
                            </span>
                          )}
                        </a>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep("sealed")}
                      className="inline-flex items-center justify-center gap-2 border border-tinta-archivo/25 px-4 py-3.5 font-mono text-[11px] uppercase tracking-widest text-tinta-archivo/75 transition-colors hover:border-tinta-archivo hover:text-tinta-archivo"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Ver sobre</span>
                    </button>
                  </div>

                  {/* Línea editorial de cierre */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-bronce-antiguo/30 pt-4 font-mono text-[10px] uppercase tracking-widest text-tinta-archivo/60">
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-bronce-antiguo" />
                      HOJA PERSONALIZADA EN RECEPCIÓN · FEB 2027
                    </span>
                    <span>BENEFICIO DE REGRESO · FEB 2028</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Footer discreto hacia la landing principal */}
            {!isPreview && (
              <footer className="mt-8 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-papel-algodon/65 transition-colors hover:text-bronce-antiguo"
                >
                  <span>
                    Grupo Orgánico Hoteles Boutique · Campaña «El Tiempo Que Nos
                    Debemos» →
                  </span>
                </Link>
              </footer>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
