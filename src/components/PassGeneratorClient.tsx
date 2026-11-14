"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  Lock,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Unlock,
} from "lucide-react";
import { CONCIERGE_PIN, HOTELS, getHotelBySlug } from "@/data/hotels";
import {
  encodePassToken,
  generateSuggestedFolio,
  type PassData,
} from "@/lib/passCodec";
import DigitalPassView from "@/components/DigitalPassView";

const SESSION_STORAGE_KEY = "gohb-generador-unlocked";

const DATE_PRESETS = [
  "Viernes 12 de Febrero 2027 · 15:00 hrs",
  "Sábado 13 de Febrero 2027 · 15:00 hrs",
  "Domingo 14 de Febrero 2027 · 14:00 hrs",
];

const DEDICATION_TEMPLATES = [
  {
    label: "Mirar hacia adelante",
    text: "Casi todos celebran lo que ya fue; yo quiero apartar desde hoy el tiempo que aún nos debemos. Este fin de semana firmaremos el inicio de nuestra próxima cita en 2028.",
  },
  {
    label: "Escapada sin relojes",
    text: "Para detener la prisa por un par de días y dedicarnos el tiempo que tanto merecemos. Prepara tu maleta sin alarmas ni pendientes.",
  },
  {
    label: "Cita de regreso",
    text: "Hoy celebramos el presente dejando pactado volver a coincidir exactamente dentro de un año. Gracias por compartir conmigo todo lo que viene.",
  },
];

export default function PassGeneratorClient() {
  // Control de acceso PIN
  const [mounted, setMounted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [rememberSession, setRememberSession] = useState(true);
  const [pinError, setPinError] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Estado del formulario del pase
  const [origin, setOrigin] = useState("");
  const [folio, setFolio] = useState("GO-2027-014");
  const [remitente, setRemitente] = useState("Santiago");
  const [destinatario, setDestinatario] = useState("Valeria");
  const [hotelSlug, setHotelSlug] = useState(HOTELS[0].slug);
  const [experienciaIndex, setExperienciaIndex] = useState<0 | 1>(0);
  const [fechaLlegada, setFechaLlegada] = useState(DATE_PRESETS[0]);
  const [dedicatoria, setDedicatoria] = useState(DEDICATION_TEMPLATES[0].text);
  const [destinoSecreto, setDestinoSecreto] = useState(false);

  // Controles de vista previa y copiado
  const [previewStep, setPreviewStep] = useState<"sealed" | "opened">("opened");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);
    try {
      if (window.sessionStorage.getItem(SESSION_STORAGE_KEY) === "1") {
        setIsUnlocked(true);
      }
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
  }, []);

  const selectedHotel = useMemo(
    () => getHotelBySlug(hotelSlug) ?? HOTELS[0],
    [hotelSlug]
  );

  const selectedExperience =
    selectedHotel.experiencias[experienciaIndex] ??
    selectedHotel.experiencias[0];

  const passData: PassData = useMemo(
    () => ({
      folio,
      remitente,
      destinatario,
      hotelSlug: selectedHotel.slug,
      experienciaIndex:
        experienciaIndex < selectedHotel.experiencias.length
          ? experienciaIndex
          : 0,
      fechaLlegada,
      dedicatoria,
      destinoSecreto,
    }),
    [
      folio,
      remitente,
      destinatario,
      selectedHotel,
      experienciaIndex,
      fechaLlegada,
      dedicatoria,
      destinoSecreto,
    ]
  );

  const token = useMemo(() => encodePassToken(passData), [passData]);
  const relativeUrl = `/pase/${token}`;
  const fullUrl = origin ? `${origin}${relativeUrl}` : relativeUrl;

  const whatsappShareUrl = useMemo(() => {
    const destinatarioClean = destinatario.trim() || "amor";
    const remitenteClean = remitente.trim() || "alguien especial";
    const message = `Hola ${destinatarioClean}, ${remitenteClean} preparó tu invitación digital de Grupo Orgánico para «El Tiempo Que Nos Debemos» (Folio ${
      folio.trim() || "GO-2027"
    }). Ábrela aquí: ${fullUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, [destinatario, remitente, folio, fullUrl]);

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === CONCIERGE_PIN) {
      setPinError("");
      setIsUnlocked(true);
      if (rememberSession) {
        try {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
        } catch {
          // Ignorar errores de almacenamiento
        }
      }
    } else {
      setPinError("PIN incorrecto. Verifica el código de acceso interno.");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPinInput("");
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignorar
    }
  };

  const handleHotelChange = (nextSlug: string) => {
    setHotelSlug(nextSlug);
    setExperienciaIndex(0);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = fullUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      setCopied(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tinta-archivo text-papel-algodon">
        <span className="font-mono text-xs uppercase tracking-widest text-bronce-antiguo">
          CARGANDO MESA DE ARCHIVO...
        </span>
      </div>
    );
  }

  // Pantalla de acceso PIN
  if (!isUnlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-tinta-archivo px-4 py-12 text-papel-algodon paper-texture-dark">
        <div className="w-full max-w-md border border-bronce-antiguo/50 bg-tinta-archivo/95 p-8 shadow-2xl sm:p-10">
          <div className="flex items-center justify-between border-b border-bronce-antiguo/25 pb-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
              USO INTERNO · CONCIERGE GOHB
            </span>
            <Lock className="h-4 w-4 text-bronce-antiguo" />
          </div>

          <h1 className="mt-6 font-serif text-3xl font-normal text-papel-algodon sm:text-4xl">
            Generador de{" "}
            <span className="italic text-bronce-antiguo">Invitaciones</span>
          </h1>
          <p className="mt-2 font-sans text-sm font-light leading-relaxed text-papel-algodon/75">
            Ingresa el PIN de Concierge para emitir enlaces personalizados de
            «El Tiempo Que Nos Debemos».
          </p>

          <form onSubmit={handleUnlock} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="concierge-pin"
                className="block font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo"
              >
                PIN DE ACCESO
              </label>
              <div className="relative mt-2">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-bronce-antiguo/75" />
                <input
                  id="concierge-pin"
                  type={showPin ? "text" : "password"}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError("");
                  }}
                  placeholder="Ingresa el PIN de Concierge"
                  autoFocus
                  className="w-full border border-bronce-antiguo/45 bg-verde-organico/20 py-3 pl-10 pr-11 font-mono text-sm tracking-widest text-papel-algodon placeholder:font-sans placeholder:tracking-normal placeholder:text-papel-algodon/40 focus:border-bronce-antiguo focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  aria-label={showPin ? "Ocultar PIN" : "Mostrar PIN"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-papel-algodon/60 hover:text-bronce-antiguo"
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {pinError && (
                <p className="mt-2 font-sans text-xs text-red-300">{pinError}</p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 font-sans text-xs text-papel-algodon/80">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="h-4 w-4 accent-bronce-antiguo"
              />
              <span>Recordar sesión en este navegador (sessionStorage)</span>
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 border border-bronce-antiguo bg-bronce-antiguo px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-tinta-archivo transition-colors hover:bg-papel-algodon"
            >
              <Unlock className="h-4 w-4" />
              <span>Acceder al generador</span>
            </button>
          </form>

          <div className="mt-7 border-t border-bronce-antiguo/20 pt-5 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-papel-algodon/65 hover:text-bronce-antiguo"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver a la campaña principal</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-tinta-archivo text-papel-algodon paper-texture-dark">
      {/* Cabecera superior limpia del generador */}
      <header className="border-b border-bronce-antiguo/30 bg-tinta-archivo/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronce-antiguo">
              GRUPO ORGÁNICO HOTELES BOUTIQUE · EMISIÓN DE PASES
            </p>
            <h1 className="mt-1 font-serif text-2xl font-normal text-papel-algodon sm:text-3xl">
              Generador de{" "}
              <span className="italic text-bronce-antiguo">
                Pagaré de Tiempo Digital
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-bronce-antiguo/40 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-papel-algodon/85 transition-colors hover:border-bronce-antiguo hover:text-bronce-antiguo"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Ver landing</span>
            </Link>
            <button
              type="button"
              onClick={handleLock}
              className="inline-flex items-center gap-1.5 border border-lacre-borgona/70 bg-lacre-borgona/25 px-3.5 py-2 font-mono text-[11px] uppercase tracking-widest text-papel-algodon/85 transition-colors hover:bg-lacre-borgona"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Bloquear</span>
            </button>
          </div>
        </div>
      </header>

      {/* Layout dividido en 2 columnas en desktop */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* COLUMNA IZQUIERDA: FORMULARIO DE CREACIÓN */}
          <section className="border border-bronce-antiguo/45 bg-tinta-archivo/95 p-6 sm:p-8 lg:col-span-6">
            <div className="border-b border-bronce-antiguo/25 pb-5">
              <span className="font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
                DATOS DE LA INVITACIÓN
              </span>
              <h2 className="mt-1 font-serif text-2xl font-normal text-papel-algodon">
                Personalizar certificado digital
              </h2>
            </div>

            <div className="mt-6 space-y-6">
              {/* Número de Folio */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="pass-folio"
                    className="font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo"
                  >
                    NÚMERO DE FOLIO
                  </label>
                  <button
                    type="button"
                    onClick={() => setFolio(generateSuggestedFolio())}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon/75 transition-colors hover:text-bronce-antiguo"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Sugerir otro</span>
                  </button>
                </div>
                <input
                  id="pass-folio"
                  type="text"
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                  placeholder="GO-2027-014"
                  className="mt-2 w-full border border-bronce-antiguo/40 bg-verde-organico/20 px-4 py-3 font-mono text-sm uppercase tracking-widest text-papel-algodon placeholder:text-papel-algodon/35 focus:border-bronce-antiguo focus:outline-none"
                />
              </div>

              {/* Remitente y Destinatario */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="pass-remitente"
                    className="block font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo"
                  >
                    DE: (QUIEN REGALA)
                  </label>
                  <input
                    id="pass-remitente"
                    type="text"
                    value={remitente}
                    onChange={(e) => setRemitente(e.target.value)}
                    placeholder="Nombre de quien regala"
                    className="mt-2 w-full border border-bronce-antiguo/40 bg-verde-organico/20 px-4 py-3 font-sans text-sm text-papel-algodon placeholder:text-papel-algodon/35 focus:border-bronce-antiguo focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pass-destinatario"
                    className="block font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo"
                  >
                    PARA: (QUIEN RECIBE)
                  </label>
                  <input
                    id="pass-destinatario"
                    type="text"
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                    placeholder="Nombre de su pareja"
                    className="mt-2 w-full border border-bronce-antiguo/40 bg-verde-organico/20 px-4 py-3 font-sans text-sm text-papel-algodon placeholder:text-papel-algodon/35 focus:border-bronce-antiguo focus:outline-none"
                  />
                </div>
              </div>

              {/* Selector de Hotel */}
              <div>
                <label
                  htmlFor="pass-hotel"
                  className="block font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo"
                >
                  PROPIEDAD / HOTEL ({HOTELS.length} DESTINOS)
                </label>
                <select
                  id="pass-hotel"
                  value={selectedHotel.slug}
                  onChange={(e) => handleHotelChange(e.target.value)}
                  className="mt-2 w-full border border-bronce-antiguo/40 bg-tinta-archivo px-4 py-3 font-sans text-sm text-papel-algodon focus:border-bronce-antiguo focus:outline-none"
                >
                  {HOTELS.map((h) => (
                    <option key={h.slug} value={h.slug}>
                      {h.nombre} — {h.ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Experiencia */}
              <div>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
                  EXPERIENCIA RESERVADA EN {selectedHotel.nombre.toUpperCase()}
                </span>
                <div className="mt-2 grid grid-cols-1 gap-3">
                  {selectedHotel.experiencias.map((exp, idx) => {
                    const isSelected = idx === (experienciaIndex < selectedHotel.experiencias.length ? experienciaIndex : 0);
                    return (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => setExperienciaIndex(idx === 1 ? 1 : 0)}
                        className={`flex items-start justify-between gap-3 border p-4 text-left transition-all ${
                          isSelected
                            ? "border-bronce-antiguo bg-verde-organico/45 text-papel-algodon"
                            : "border-bronce-antiguo/30 bg-tinta-archivo/60 text-papel-algodon/75 hover:border-bronce-antiguo/70"
                        }`}
                      >
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                            OPCIÓN 0{idx + 1} · {exp.enfoque}
                          </span>
                          <p className="mt-1 font-serif text-lg font-medium text-papel-algodon">
                            {exp.titulo}
                          </p>
                        </div>
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center border ${
                            isSelected
                              ? "border-bronce-antiguo bg-bronce-antiguo text-tinta-archivo"
                              : "border-bronce-antiguo/40"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fecha y hora de cita / check-in */}
              <div>
                <label
                  htmlFor="pass-fecha"
                  className="block font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo"
                >
                  FECHA Y HORA DE CITA / CHECK-IN
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DATE_PRESETS.map((preset) => {
                    const active = fechaLlegada === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFechaLlegada(preset)}
                        className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                          active
                            ? "border-bronce-antiguo bg-bronce-antiguo text-tinta-archivo"
                            : "border-bronce-antiguo/35 bg-verde-organico/20 text-papel-algodon/80 hover:border-bronce-antiguo"
                        }`}
                      >
                        {preset.replace(" de Febrero 2027 ·", " ·")}
                      </button>
                    );
                  })}
                </div>
                <input
                  id="pass-fecha"
                  type="text"
                  value={fechaLlegada}
                  onChange={(e) => setFechaLlegada(e.target.value)}
                  placeholder="Ej. Sábado 13 de Febrero 2027 · 15:00 hrs"
                  className="mt-2.5 w-full border border-bronce-antiguo/40 bg-verde-organico/20 px-4 py-3 font-sans text-sm text-papel-algodon placeholder:text-papel-algodon/35 focus:border-bronce-antiguo focus:outline-none"
                />
              </div>

              {/* Dedicatoria personal + 3 plantillas de 1 clic */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="pass-dedicatoria"
                    className="font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo"
                  >
                    DEDICATORIA PERSONAL
                  </label>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-papel-algodon/55">
                    PLANTILLAS DE 1 CLIC:
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {DEDICATION_TEMPLATES.map((tpl) => {
                    const isUsed = dedicatoria === tpl.text;
                    return (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => setDedicatoria(tpl.text)}
                        className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-sans text-xs transition-colors ${
                          isUsed
                            ? "border-bronce-antiguo bg-bronce-antiguo/20 text-bronce-antiguo"
                            : "border-bronce-antiguo/30 bg-tinta-archivo text-papel-algodon/80 hover:border-bronce-antiguo/70"
                        }`}
                      >
                        <Sparkles className="h-3 w-3 text-bronce-antiguo" />
                        <span>{tpl.label}</span>
                      </button>
                    );
                  })}
                </div>

                <textarea
                  id="pass-dedicatoria"
                  rows={4}
                  value={dedicatoria}
                  onChange={(e) => setDedicatoria(e.target.value)}
                  placeholder="Escribe un mensaje íntimo y memorable..."
                  className="mt-2.5 w-full border border-bronce-antiguo/40 bg-verde-organico/20 px-4 py-3 font-sans text-sm leading-relaxed text-papel-algodon placeholder:text-papel-algodon/35 focus:border-bronce-antiguo focus:outline-none"
                />
              </div>

              {/* Switch / Toggle destacado: Modo Sorpresa */}
              <div
                className={`border p-5 transition-colors ${
                  destinoSecreto
                    ? "border-lacre-borgona bg-lacre-borgona/20"
                    : "border-bronce-antiguo/40 bg-verde-organico/25"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                      PRIVACIDAD DE DESTINO
                    </span>
                    <p className="mt-1 font-sans text-sm font-medium text-papel-algodon">
                      Modo Sorpresa: Mantener el destino en secreto y mostrar
                      solo pistas de equipaje
                    </p>
                    <p className="mt-1 font-sans text-xs font-light text-papel-algodon/70">
                      {destinoSecreto
                        ? `Oculta «${selectedHotel.nombre}» y muestra clima (${selectedHotel.packingHints.clima}) y recomendaciones de maleta.`
                        : "Actualmente revela el hotel, fotografía, experiencia reservada y enlace a Google Maps."}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={destinoSecreto}
                    aria-label="Activar modo sorpresa para ocultar el destino"
                    onClick={() => setDestinoSecreto((prev) => !prev)}
                    className={`relative mt-1 inline-flex h-7 w-12 shrink-0 cursor-pointer items-center border transition-colors ${
                      destinoSecreto
                        ? "border-bronce-antiguo bg-lacre-borgona"
                        : "border-bronce-antiguo/60 bg-tinta-archivo"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform bg-papel-algodon transition-transform ${
                        destinoSecreto ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* COLUMNA DERECHA: VISTA PREVIA EN VIVO + ACCIONES DE ENTREGA */}
          <section className="space-y-6 lg:sticky lg:top-6 lg:col-span-6">
            {/* Tarjeta de Acciones de Entrega */}
            <div className="border border-bronce-antiguo/60 bg-tinta-archivo/95 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
                  ENLACE GENERADO EN TIEMPO REAL
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-papel-algodon/65">
                  {destinoSecreto ? "SIN SPOILERS" : selectedHotel.nombre}
                </span>
              </div>

              <div className="mt-3 overflow-hidden border border-bronce-antiguo/30 bg-black/40 px-3.5 py-2.5">
                <p className="truncate font-mono text-xs text-papel-algodon/80">
                  {fullUrl}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Botón principal en bronce-antiguo */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-2 border border-bronce-antiguo bg-bronce-antiguo px-4 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-tinta-archivo transition-colors hover:bg-papel-algodon sm:col-span-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>¡Enlace copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar enlace de invitación</span>
                    </>
                  )}
                </button>

                {/* Botón secundario en verde-organico */}
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-bronce-antiguo/45 bg-verde-organico px-4 py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-papel-algodon transition-colors hover:border-bronce-antiguo hover:bg-verde-organico/80"
                >
                  <MessageCircle className="h-4 w-4 text-bronce-antiguo" />
                  <span>Enviar por WhatsApp</span>
                </a>

                {/* Botón terciario */}
                <a
                  href={relativeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-bronce-antiguo/40 bg-tinta-archivo px-4 py-3 font-sans text-xs font-medium uppercase tracking-[0.12em] text-papel-algodon transition-colors hover:border-bronce-antiguo hover:text-bronce-antiguo"
                >
                  <ExternalLink className="h-4 w-4 text-bronce-antiguo" />
                  <span>Abrir en nueva pestaña</span>
                </a>
              </div>
            </div>

            {/* Marco interactivo de previsualización móvil */}
            <div className="border border-bronce-antiguo/40 bg-black/35 p-4 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
                  VISTA PREVIA EN CELULAR
                </span>

                <div className="inline-flex border border-bronce-antiguo/40 bg-tinta-archivo p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewStep("sealed")}
                    className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                      previewStep === "sealed"
                        ? "bg-bronce-antiguo text-tinta-archivo"
                        : "text-papel-algodon/75 hover:text-papel-algodon"
                    }`}
                  >
                    Sobre
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewStep("opened")}
                    className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                      previewStep === "opened"
                        ? "bg-bronce-antiguo text-tinta-archivo"
                        : "text-papel-algodon/75 hover:text-papel-algodon"
                    }`}
                  >
                    Pagaré abierto
                  </button>
                </div>
              </div>

              <div className="mx-auto max-w-[390px] overflow-hidden rounded-[2rem] border-2 border-bronce-antiguo/55 bg-tinta-archivo p-2 shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
                <div className="max-h-[680px] overflow-y-auto rounded-[1.5rem] border border-bronce-antiguo/20">
                  <DigitalPassView
                    pass={passData}
                    packingHints={selectedHotel.packingHints}
                    hotel={selectedHotel}
                    experiencia={selectedExperience}
                    controlledStep={previewStep}
                    onStepChange={setPreviewStep}
                    isPreview
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

