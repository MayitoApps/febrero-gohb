"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Database,
  Eye,
  EyeOff,
  ExternalLink,
  FilePlus2,
  KeyRound,
  Lock,
  MessageCircle,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Unlock,
  X,
} from "lucide-react";
import { HOTELS, getHotelBySlug } from "@/data/hotels";
import type { PassRecordDto, PassStatus } from "@/db/schema";
import {
  encodePassToken,
  generateSuggestedFolio,
  type PassData,
} from "@/lib/passCodec";
import {
  ARRIVAL_TIME_OPTIONS,
  CAMPAIGN_WEEK_DAYS,
  WEEKEND_PRESETS,
  describeIsoDate,
  formatArrivalDatesSummary,
  normalizeSelectedIsoDates,
  parseIsoDateParts,
} from "@/lib/passDates";
import DigitalPassView from "@/components/DigitalPassView";
import PassHistoryPanel from "@/components/PassHistoryPanel";

const INITIAL_DATES = WEEKEND_PRESETS[0].dates;
const INITIAL_TIME = WEEKEND_PRESETS[0].defaultTime;

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

function toDateTimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function formatRevealPreview(localValue: string): string | null {
  if (!localValue) return null;
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return localValue;
  }
}

export default function PassGeneratorClient() {
  // Control de acceso PIN respaldado por cookie HttpOnly en servidor
  const [mounted, setMounted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [rememberSession, setRememberSession] = useState(true);
  const [pinError, setPinError] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Estado de conexión e historial en Neon Postgres
  const [dbConfigured, setDbConfigured] = useState(false);
  const [dbPasses, setDbPasses] = useState<PassRecordDto[]>([]);
  const [suggestedNextFolio, setSuggestedNextFolio] = useState("GO-2027-001");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [hotelFilter, setHotelFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [busyRowSlug, setBusyRowSlug] = useState<string | null>(null);

  // Edición vs creación en Neon
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const [saveError, setSaveError] = useState("");
  const hasAppliedInitialFolioRef = useRef(false);

  // Estado del formulario del pase
  const [origin, setOrigin] = useState("");
  const [folio, setFolio] = useState("GO-2027-014");
  const [remitente, setRemitente] = useState("Santiago");
  const [destinatario, setDestinatario] = useState("Valeria");
  const [hotelSlug, setHotelSlug] = useState(HOTELS[0].slug);
  const [experienciaIndex, setExperienciaIndex] = useState<0 | 1>(0);
  const [selectedDates, setSelectedDates] = useState<string[]>(INITIAL_DATES);
  const [arrivalTime, setArrivalTime] = useState<string>(INITIAL_TIME);
  const [customDateInput, setCustomDateInput] = useState("2027-02-19");
  const [fechaLlegada, setFechaLlegada] = useState(() =>
    formatArrivalDatesSummary(INITIAL_DATES, INITIAL_TIME)
  );
  const [dedicatoria, setDedicatoria] = useState(DEDICATION_TEMPLATES[0].text);
  const [destinoSecreto, setDestinoSecreto] = useState(false);
  const [revealAtLocal, setRevealAtLocal] = useState("");
  const [contactoCliente, setContactoCliente] = useState("");
  const [notasConcierge, setNotasConcierge] = useState("");

  // Controles de vista previa y copiado
  const [previewStep, setPreviewStep] = useState<"sealed" | "opened">("opened");
  const [copied, setCopied] = useState(false);

  const fetchPassesHistory = useCallback(
    async (opts?: {
      search?: string;
      hotel?: string;
      estado?: string;
      applySuggestedFolio?: boolean;
    }) => {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        const params = new URLSearchParams();
        const q = (opts?.search ?? searchFilter).trim();
        const h = opts?.hotel ?? hotelFilter;
        const st = opts?.estado ?? statusFilter;
        if (q) params.set("search", q);
        if (h && h !== "todos") params.set("hotelSlug", h);
        if (st && st !== "todos") params.set("estado", st);

        const res = await fetch(`/api/passes?${params.toString()}`, {
          cache: "no-store",
        });
        if (res.status === 401) {
          setIsUnlocked(false);
          return;
        }
        const payload = (await res.json()) as {
          dbConfigured?: boolean;
          passes?: PassRecordDto[];
          suggestedNextFolio?: string;
          error?: string;
        };

        if (!res.ok) {
          setHistoryError(
            payload.error || "No se pudo consultar el historial de Neon."
          );
          return;
        }

        const isConfigured = Boolean(payload.dbConfigured);
        setDbConfigured(isConfigured);
        setDbPasses(Array.isArray(payload.passes) ? payload.passes : []);
        if (payload.suggestedNextFolio) {
          setSuggestedNextFolio(payload.suggestedNextFolio);
          if (
            opts?.applySuggestedFolio &&
            isConfigured &&
            !hasAppliedInitialFolioRef.current
          ) {
            hasAppliedInitialFolioRef.current = true;
            setFolio(payload.suggestedNextFolio);
          }
        }
      } catch {
        setHistoryError("Error de red al consultar Neon Postgres.");
      } finally {
        setHistoryLoading(false);
      }
    },
    [hotelFilter, searchFilter, statusFilter]
  );

  useEffect(() => {
    setOrigin(window.location.origin);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/concierge/auth", { cache: "no-store" });
        const data = (await res.json()) as {
          authenticated?: boolean;
          dbConfigured?: boolean;
        };
        if (cancelled) return;
        setDbConfigured(Boolean(data.dbConfigured));
        if (data.authenticated) {
          setIsUnlocked(true);
        }
      } catch {
        // Ignorar error inicial de red
      } finally {
        if (!cancelled) {
          setMounted(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sincronizar historial cuando se desbloquea o cambian los filtros
  useEffect(() => {
    if (!isUnlocked) return;
    const timer = window.setTimeout(() => {
      void fetchPassesHistory({
        applySuggestedFolio: !editingSlug && !savedSlug,
      });
    }, 180);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked, searchFilter, hotelFilter, statusFilter]);

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
      ...(selectedDates.length > 0
        ? { fechasSeleccionadas: selectedDates }
        : {}),
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
      selectedDates,
      dedicatoria,
      destinoSecreto,
    ]
  );

  const applyDatesAndTime = (nextDates: string[], nextTime: string) => {
    const normalized = normalizeSelectedIsoDates(nextDates);
    setSelectedDates(normalized);
    setArrivalTime(nextTime);
    if (normalized.length > 0) {
      setFechaLlegada(formatArrivalDatesSummary(normalized, nextTime));
    }
  };

  const toggleDateIso = (iso: string) => {
    const exists = selectedDates.includes(iso);
    const next = exists
      ? selectedDates.filter((d) => d !== iso)
      : [...selectedDates, iso];
    applyDatesAndTime(next, arrivalTime);
  };

  const handleAddCustomDate = () => {
    if (!customDateInput) return;
    if (!selectedDates.includes(customDateInput)) {
      applyDatesAndTime([...selectedDates, customDateInput], arrivalTime);
    }
  };

  const apply24HoursBeforeCheckIn = () => {
    const firstIso = selectedDates[0] ?? "2027-02-12";
    const parts = parseIsoDateParts(firstIso);
    if (!parts) return;
    const timeMatch = arrivalTime.match(/(\d{1,2}):(\d{2})/);
    const hour = timeMatch ? Number(timeMatch[1]) : 15;
    const minute = timeMatch ? Number(timeMatch[2]) : 0;
    const dt = new Date(parts.year, parts.month - 1, parts.day, hour, minute);
    dt.setDate(dt.getDate() - 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    setRevealAtLocal(
      `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
        dt.getDate()
      )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
    );
  };

  const extraSelectedDates = useMemo(() => {
    const campaignIsos = new Set(CAMPAIGN_WEEK_DAYS.map((d) => d.iso));
    return selectedDates
      .filter((iso) => !campaignIsos.has(iso))
      .map((iso) => describeIsoDate(iso))
      .filter((d): d is NonNullable<typeof d> => d !== null);
  }, [selectedDates]);

  const activeDbSlug = editingSlug ?? savedSlug;
  const fallbackToken = useMemo(() => encodePassToken(passData), [passData]);
  const relativeUrl =
    dbConfigured && activeDbSlug
      ? `/pase/${activeDbSlug}`
      : `/pase/${fallbackToken}`;
  const fullUrl = origin ? `${origin}${relativeUrl}` : relativeUrl;

  const whatsappShareUrl = useMemo(() => {
    const destinatarioClean = destinatario.trim() || "amor";
    const remitenteClean = remitente.trim() || "alguien especial";
    const message = `Hola ${destinatarioClean}, ${remitenteClean} preparó tu invitación digital de Grupo Orgánico para «El Tiempo Que Nos Debemos» (Folio ${
      folio.trim() || "GO-2027"
    }). Ábrela aquí: ${fullUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, [destinatario, remitente, folio, fullUrl]);

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setPinError("");
    try {
      const res = await fetch("/api/concierge/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput, remember: rememberSession }),
      });
      const data = (await res.json()) as {
        authenticated?: boolean;
        dbConfigured?: boolean;
        error?: string;
      };
      if (!res.ok || !data.authenticated) {
        setPinError(
          data.error || "PIN incorrecto. Verifica el código de acceso interno."
        );
        return;
      }
      setDbConfigured(Boolean(data.dbConfigured));
      setIsUnlocked(true);
    } catch {
      setPinError("No pudimos verificar el PIN. Intenta de nuevo.");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLock = async () => {
    try {
      await fetch("/api/concierge/auth", { method: "DELETE" });
    } catch {
      // Ignorar
    }
    setIsUnlocked(false);
    setPinInput("");
    setEditingSlug(null);
    setSavedSlug(null);
  };

  const handleHotelChange = (nextSlug: string) => {
    setHotelSlug(nextSlug);
    setExperienciaIndex(0);
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
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

  const savePassToNeon = async (copyAfter: boolean) => {
    setSaveBusy(true);
    setSaveError("");
    setSaveFeedback("");

    const revealIso =
      destinoSecreto && revealAtLocal
        ? new Date(revealAtLocal).toISOString()
        : null;

    const payload = {
      folio: folio.trim(),
      remitente: remitente.trim(),
      destinatario: destinatario.trim(),
      hotelSlug: selectedHotel.slug,
      experienciaIndex:
        experienciaIndex < selectedHotel.experiencias.length
          ? experienciaIndex
          : 0,
      fechaLlegada: fechaLlegada.trim(),
      fechasSeleccionadas: selectedDates,
      dedicatoria: dedicatoria.trim(),
      destinoSecreto,
      revealAt: revealIso,
      contactoCliente: contactoCliente.trim() || null,
      notasConcierge: notasConcierge.trim() || null,
    };

    try {
      const targetSlug = editingSlug ?? savedSlug;
      const isUpdate = Boolean(targetSlug);
      const endpoint = isUpdate
        ? `/api/passes/${encodeURIComponent(targetSlug!)}`
        : "/api/passes";

      const res = await fetch(endpoint, {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setIsUnlocked(false);
        return;
      }

      const data = (await res.json()) as {
        pass?: PassRecordDto;
        error?: string;
      };

      if (!res.ok || !data.pass) {
        setSaveError(
          data.error || "No pudimos guardar este pase en Neon Postgres."
        );
        return;
      }

      setSavedSlug(data.pass.slug);
      setEditingSlug(data.pass.slug);
      const shortPath = `/pase/${data.pass.slug}`;
      const fullShort = origin ? `${origin}${shortPath}` : shortPath;

      if (copyAfter) {
        await copyToClipboard(fullShort);
        setSaveFeedback(
          isUpdate
            ? `Cambios guardados en Neon y enlace corto copiado (${data.pass.slug}).`
            : `Pase creado en Neon y enlace corto copiado (${data.pass.slug}).`
        );
      } else {
        setSaveFeedback(
          isUpdate
            ? `Cambios guardados en Neon (${data.pass.slug}). El enlace corto no cambió.`
            : `Pase registrado en Neon con enlace corto /pase/${data.pass.slug}.`
        );
      }

      await fetchPassesHistory();
    } catch {
      setSaveError("Error de red al guardar en Neon Postgres.");
    } finally {
      setSaveBusy(false);
    }
  };

  const resetForNewPass = () => {
    setEditingSlug(null);
    setSavedSlug(null);
    setSaveError("");
    setSaveFeedback("");
    setFolio(
      dbConfigured ? suggestedNextFolio : generateSuggestedFolio()
    );
    setRemitente("");
    setDestinatario("");
    setDestinoSecreto(false);
    setRevealAtLocal("");
    setContactoCliente("");
    setNotasConcierge("");
    applyDatesAndTime(INITIAL_DATES, INITIAL_TIME);
  };

  const handleLoadPassForEdit = (item: PassRecordDto) => {
    setEditingSlug(item.slug);
    setSavedSlug(item.slug);
    setSaveError("");
    setSaveFeedback(`Editando pase ${item.folio} (/pase/${item.slug}).`);
    setFolio(item.folio);
    setRemitente(item.remitente);
    setDestinatario(item.destinatario);
    setHotelSlug(item.hotelSlug);
    setExperienciaIndex(item.experienciaIndex);
    setSelectedDates(item.fechasSeleccionadas);
    const matchedTime = item.fechaLlegada.match(/(\d{1,2}:\d{2}\s*hrs)/i);
    if (matchedTime) {
      const normalizedTime = matchedTime[1].toLowerCase().replace(/\s+/, " ");
      if (ARRIVAL_TIME_OPTIONS.includes(normalizedTime)) {
        setArrivalTime(normalizedTime);
      }
    }
    setFechaLlegada(item.fechaLlegada);
    setDedicatoria(item.dedicatoria);
    setDestinoSecreto(item.destinoSecreto);
    setRevealAtLocal(toDateTimeLocalValue(item.revealAt));
    setContactoCliente(item.contactoCliente ?? "");
    setNotasConcierge(item.notasConcierge ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdatePassStatus = async (
    slug: string,
    nextStatus: PassStatus
  ) => {
    setBusyRowSlug(slug);
    try {
      const res = await fetch(`/api/passes/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nextStatus }),
      });
      if (res.status === 401) {
        setIsUnlocked(false);
        return;
      }
      await fetchPassesHistory();
    } finally {
      setBusyRowSlug(null);
    }
  };

  const handleDeletePass = async (slug: string) => {
    setBusyRowSlug(slug);
    try {
      const res = await fetch(`/api/passes/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        setIsUnlocked(false);
        return;
      }
      if (editingSlug === slug) {
        resetForNewPass();
      }
      await fetchPassesHistory({ applySuggestedFolio: !editingSlug });
    } finally {
      setBusyRowSlug(null);
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
            Ingresa el PIN de Concierge para emitir y administrar enlaces de «El
            Tiempo Que Nos Debemos».
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
                <p className="mt-2 font-sans text-xs text-red-300">
                  {pinError}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 font-sans text-xs text-papel-algodon/80">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="h-4 w-4 accent-bronce-antiguo"
              />
              <span>Mantener sesión abierta 7 días en este navegador</span>
            </label>

            <button
              type="submit"
              disabled={authBusy}
              className="flex w-full items-center justify-center gap-2 border border-bronce-antiguo bg-bronce-antiguo px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-tinta-archivo transition-colors hover:bg-papel-algodon disabled:opacity-60"
            >
              <Unlock className="h-4 w-4" />
              <span>{authBusy ? "Verificando..." : "Acceder al generador"}</span>
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
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronce-antiguo">
                GRUPO ORGÁNICO HOTELES BOUTIQUE · EMISIÓN DE PASES
              </p>
              <span
                className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                  dbConfigured
                    ? "border-emerald-500/50 bg-emerald-950/50 text-emerald-200"
                    : "border-bronce-antiguo/45 bg-bronce-antiguo/15 text-bronce-antiguo"
                }`}
              >
                <Database className="h-2.5 w-2.5" />
                {dbConfigured
                  ? "NEON POSTGRES CONECTADO"
                  : "NEON LISTO · SIN DATABASE_URL"}
              </span>
            </div>
            <h1 className="mt-1 font-serif text-2xl font-normal text-papel-algodon sm:text-3xl">
              Generador de{" "}
              <span className="italic text-bronce-antiguo">
                Pagaré de Tiempo Digital
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {dbConfigured && (
              <button
                type="button"
                onClick={resetForNewPass}
                className="inline-flex items-center gap-1.5 border border-bronce-antiguo/55 bg-verde-organico/45 px-3.5 py-2 font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo transition-colors hover:bg-bronce-antiguo hover:text-tinta-archivo"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                <span>Nuevo pase</span>
              </button>
            )}
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
          {/* COLUMNA IZQUIERDA: FORMULARIO DE CREACIÓN / EDICIÓN */}
          <section className="border border-bronce-antiguo/45 bg-tinta-archivo/95 p-6 sm:p-8 lg:col-span-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-bronce-antiguo/25 pb-5">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
                  {editingSlug
                    ? `EDITANDO REGISTRO · /pase/${editingSlug}`
                    : "DATOS DE LA INVITACIÓN"}
                </span>
                <h2 className="mt-1 font-serif text-2xl font-normal text-papel-algodon">
                  {editingSlug
                    ? "Actualizar certificado guardado"
                    : "Personalizar certificado digital"}
                </h2>
              </div>

              {editingSlug && (
                <button
                  type="button"
                  onClick={resetForNewPass}
                  className="border border-bronce-antiguo/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon/75 hover:border-bronce-antiguo hover:text-bronce-antiguo"
                >
                  Salir de edición
                </button>
              )}
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
                    onClick={() =>
                      setFolio(
                        dbConfigured
                          ? suggestedNextFolio
                          : generateSuggestedFolio()
                      )
                    }
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon/75 transition-colors hover:text-bronce-antiguo"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>
                      {dbConfigured
                        ? `Siguiente libre (${suggestedNextFolio})`
                        : "Sugerir otro"}
                    </span>
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
                    const isSelected =
                      idx ===
                      (experienciaIndex < selectedHotel.experiencias.length
                        ? experienciaIndex
                        : 0);
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

              {/* Selector Multi-Fecha / Fin de semana y hora */}
              <div className="space-y-4 border border-bronce-antiguo/30 bg-verde-organico/15 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
                    <Calendar className="h-3.5 w-3.5" />
                    FECHAS DE ESTANCIA O EXPERIENCIA
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-papel-algodon/65">
                    {selectedDates.length === 0
                      ? "TEXTO LIBRE"
                      : selectedDates.length === 1
                        ? "1 DÍA SELECCIONADO"
                        : `${selectedDates.length} DÍAS SELECCIONADOS`}
                  </span>
                </div>

                {/* Atajos de fin de semana completo y combinaciones */}
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-papel-algodon/60">
                    ATAJOS DE FIN DE SEMANA O ESTANCIAS:
                  </span>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {WEEKEND_PRESETS.map((preset) => {
                      const isPresetActive =
                        preset.dates.length === selectedDates.length &&
                        preset.dates.every((d, i) => selectedDates[i] === d);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            applyDatesAndTime(
                              preset.dates,
                              preset.defaultTime
                            )
                          }
                          className={`flex flex-col items-start border px-3 py-2 text-left transition-colors ${
                            isPresetActive
                              ? "border-bronce-antiguo bg-bronce-antiguo text-tinta-archivo"
                              : "border-bronce-antiguo/35 bg-tinta-archivo/75 text-papel-algodon/90 hover:border-bronce-antiguo"
                          }`}
                        >
                          <span className="font-sans text-xs font-semibold">
                            {preset.label}
                          </span>
                          <span
                            className={`font-mono text-[10px] uppercase tracking-wider ${
                              isPresetActive
                                ? "text-tinta-archivo/75"
                                : "text-bronce-antiguo"
                            }`}
                          >
                            {preset.sublabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selección individual múltiple */}
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-papel-algodon/60">
                    O MARCA UNO O VARIOS DÍAS MANUALMENTE (FEB 2027):
                  </span>
                  <div className="mt-2 grid grid-cols-5 gap-1.5 sm:gap-2">
                    {CAMPAIGN_WEEK_DAYS.map((day) => {
                      const active = selectedDates.includes(day.iso);
                      return (
                        <button
                          key={day.iso}
                          type="button"
                          onClick={() => toggleDateIso(day.iso)}
                          aria-pressed={active}
                          className={`flex flex-col items-center border py-2 transition-all ${
                            active
                              ? "border-bronce-antiguo bg-verde-organico text-papel-algodon ring-1 ring-bronce-antiguo/60"
                              : "border-bronce-antiguo/30 bg-tinta-archivo/60 text-papel-algodon/65 hover:border-bronce-antiguo/70 hover:text-papel-algodon"
                          }`}
                        >
                          <span className="font-mono text-[9px] uppercase tracking-widest text-bronce-antiguo">
                            {day.weekdayShort}
                          </span>
                          <span className="mt-0.5 font-serif text-lg leading-none">
                            {day.dayNumber}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector para otras fechas fuera del puente 11–15 */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={customDateInput}
                      min="2027-01-01"
                      max="2028-12-31"
                      onChange={(e) => setCustomDateInput(e.target.value)}
                      aria-label="Seleccionar otra fecha en calendario"
                      className="border border-bronce-antiguo/35 bg-tinta-archivo px-2.5 py-1.5 font-mono text-xs text-papel-algodon focus:border-bronce-antiguo focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomDate}
                      className="inline-flex items-center gap-1 border border-bronce-antiguo/45 bg-tinta-archivo px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo transition-colors hover:bg-bronce-antiguo hover:text-tinta-archivo"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Agregar otra fecha</span>
                    </button>
                  </div>

                  {extraSelectedDates.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {extraSelectedDates.map((day) => (
                        <button
                          key={day.iso}
                          type="button"
                          onClick={() => toggleDateIso(day.iso)}
                          className="inline-flex items-center gap-1.5 border border-bronce-antiguo bg-verde-organico/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-papel-algodon hover:border-lacre-borgona hover:bg-lacre-borgona/50"
                        >
                          <span>
                            {day.weekdayShort} {day.dayNumber} {day.monthShort}
                          </span>
                          <X className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hora de llegada / check-in */}
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-papel-algodon/60">
                    HORA DE CHECK-IN / CITA:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ARRIVAL_TIME_OPTIONS.map((t) => {
                      const active = arrivalTime === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => applyDatesAndTime(selectedDates, t)}
                          className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                            active
                              ? "border-bronce-antiguo bg-bronce-antiguo text-tinta-archivo"
                              : "border-bronce-antiguo/30 bg-tinta-archivo text-papel-algodon/75 hover:border-bronce-antiguo"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Texto final editable en la invitación */}
                <div>
                  <label
                    htmlFor="pass-fecha"
                    className="block font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo"
                  >
                    TEXTO MOSTRADO EN LA INVITACIÓN (EDITABLE)
                  </label>
                  <input
                    id="pass-fecha"
                    type="text"
                    value={fechaLlegada}
                    onChange={(e) => setFechaLlegada(e.target.value)}
                    placeholder="Ej. Del viernes 12 al domingo 14 de febrero 2027 · Check-in 15:00 hrs"
                    className="mt-1.5 w-full border border-bronce-antiguo/40 bg-tinta-archivo px-4 py-3 font-sans text-sm text-papel-algodon placeholder:text-papel-algodon/35 focus:border-bronce-antiguo focus:outline-none"
                  />
                </div>
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

                {destinoSecreto && dbConfigured && (
                  <div className="mt-4 border-t border-bronce-antiguo/25 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="pass-reveal-at"
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo"
                      >
                        <Clock className="h-3 w-3" />
                        REVELACIÓN AUTOMÁTICA PROGRAMADA (OPCIONAL)
                      </label>
                      <button
                        type="button"
                        onClick={apply24HoursBeforeCheckIn}
                        className="font-mono text-[10px] uppercase tracking-widest text-papel-algodon/80 underline decoration-bronce-antiguo/60 underline-offset-4 hover:text-bronce-antiguo"
                      >
                        24h antes de llegada
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        id="pass-reveal-at"
                        type="datetime-local"
                        value={revealAtLocal}
                        onChange={(e) => setRevealAtLocal(e.target.value)}
                        className="border border-bronce-antiguo/40 bg-tinta-archivo px-3 py-2 font-mono text-xs text-papel-algodon focus:border-bronce-antiguo focus:outline-none"
                      />
                      {revealAtLocal && (
                        <button
                          type="button"
                          onClick={() => setRevealAtLocal("")}
                          className="border border-bronce-antiguo/35 px-2.5 py-2 font-mono text-[10px] uppercase tracking-widest text-papel-algodon/70 hover:text-papel-algodon"
                        >
                          Mantener secreto manual
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notas internas de Concierge (solo cuando Neon esté activo) */}
              {dbConfigured && (
                <div className="space-y-3 border border-bronce-antiguo/25 bg-black/25 p-4">
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo">
                    USO INTERNO RECEPCIÓN · NO VISIBLE EN LA INVITACIÓN
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="pass-contacto"
                        className="block font-mono text-[10px] uppercase tracking-widest text-papel-algodon/65"
                      >
                        CONTACTO COMPRADOR (WA / EMAIL)
                      </label>
                      <input
                        id="pass-contacto"
                        type="text"
                        value={contactoCliente}
                        onChange={(e) => setContactoCliente(e.target.value)}
                        placeholder="Para seguimiento Feb 2028"
                        className="mt-1.5 w-full border border-bronce-antiguo/30 bg-tinta-archivo px-3 py-2 font-sans text-xs text-papel-algodon placeholder:text-papel-algodon/35 focus:border-bronce-antiguo focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="pass-notas"
                        className="block font-mono text-[10px] uppercase tracking-widest text-papel-algodon/65"
                      >
                        NOTAS DE RECEPCIÓN
                      </label>
                      <input
                        id="pass-notas"
                        type="text"
                        value={notasConcierge}
                        onChange={(e) => setNotasConcierge(e.target.value)}
                        placeholder="Ej. Suite 4 · alergia nueces · vino tinto"
                        className="mt-1.5 w-full border border-bronce-antiguo/30 bg-tinta-archivo px-3 py-2 font-sans text-xs text-papel-algodon placeholder:text-papel-algodon/35 focus:border-bronce-antiguo focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* COLUMNA DERECHA: VISTA PREVIA EN VIVO + ACCIONES DE ENTREGA */}
          <section className="space-y-6 lg:sticky lg:top-6 lg:col-span-6">
            {/* Tarjeta de Acciones de Entrega */}
            <div className="border border-bronce-antiguo/60 bg-tinta-archivo/95 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
                  {dbConfigured && activeDbSlug
                    ? "ENLACE CORTO GUARDADO EN NEON"
                    : dbConfigured
                      ? "BORRADOR EN VIVO · GUARDA PARA GENERAR LINK CORTO"
                      : "ENLACE GENERADO EN TIEMPO REAL"}
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

              {saveError && (
                <div className="mt-3 flex items-start gap-2 border border-lacre-borgona bg-lacre-borgona/25 px-3 py-2 font-sans text-xs text-red-200">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {saveFeedback && (
                <div className="mt-3 flex items-start gap-2 border border-emerald-500/45 bg-emerald-950/40 px-3 py-2 font-sans text-xs text-emerald-200">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{saveFeedback}</span>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {dbConfigured ? (
                  <>
                    {/* Guardar / Actualizar + Copiar link corto en 1 clic */}
                    <button
                      type="button"
                      disabled={saveBusy}
                      onClick={() => void savePassToNeon(true)}
                      className="inline-flex items-center justify-center gap-2 border border-bronce-antiguo bg-bronce-antiguo px-4 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-tinta-archivo transition-colors hover:bg-papel-algodon disabled:opacity-60 sm:col-span-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>¡Guardado y enlace copiado!</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>
                            {saveBusy
                              ? "Guardando en Neon..."
                              : editingSlug || savedSlug
                                ? "Guardar cambios y copiar enlace corto"
                                : "Guardar en Neon y copiar enlace corto"}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={saveBusy}
                      onClick={() => void savePassToNeon(false)}
                      className="inline-flex items-center justify-center gap-2 border border-bronce-antiguo/50 bg-tinta-archivo px-4 py-3 font-sans text-xs font-medium uppercase tracking-[0.12em] text-bronce-antiguo transition-colors hover:border-bronce-antiguo hover:bg-bronce-antiguo/15 disabled:opacity-60"
                    >
                      <Database className="h-4 w-4" />
                      <span>
                        {editingSlug || savedSlug
                          ? "Actualizar cambios"
                          : "Solo guardar"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void copyToClipboard(fullUrl)}
                      className="inline-flex items-center justify-center gap-2 border border-bronce-antiguo/45 bg-tinta-archivo px-4 py-3 font-sans text-xs font-medium uppercase tracking-[0.12em] text-papel-algodon transition-colors hover:border-bronce-antiguo hover:text-bronce-antiguo"
                    >
                      <Copy className="h-4 w-4 text-bronce-antiguo" />
                      <span>Copiar URL actual</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => void copyToClipboard(fullUrl)}
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
                )}

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
                    revealAtLabel={
                      destinoSecreto ? formatRevealPreview(revealAtLocal) : null
                    }
                    isPreview
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* LIBRO DE REGISTRO E HISTORIAL EN NEON POSTGRES */}
        <PassHistoryPanel
          passes={dbPasses}
          loading={historyLoading}
          dbConfigured={dbConfigured}
          errorMessage={historyError}
          search={searchFilter}
          hotelFilter={hotelFilter}
          statusFilter={statusFilter}
          origin={origin}
          activeEditingSlug={editingSlug}
          busySlug={busyRowSlug}
          onSearchChange={setSearchFilter}
          onHotelFilterChange={setHotelFilter}
          onStatusFilterChange={setStatusFilter}
          onRefresh={() => void fetchPassesHistory()}
          onEditPass={handleLoadPassForEdit}
          onUpdateStatus={(slug, st) => void handleUpdatePassStatus(slug, st)}
          onDeletePass={(slug) => void handleDeletePass(slug)}
        />
      </main>
    </div>
  );
}
