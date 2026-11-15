"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  MessageCircle,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { HOTELS, getHotelBySlug } from "@/data/hotels";
import type { PassRecordDto, PassStatus } from "@/db/schema";

interface PassHistoryPanelProps {
  passes: PassRecordDto[];
  loading: boolean;
  dbConfigured: boolean;
  errorMessage: string;
  search: string;
  hotelFilter: string;
  statusFilter: string;
  origin: string;
  activeEditingSlug: string | null;
  busySlug: string | null;
  onSearchChange: (value: string) => void;
  onHotelFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onRefresh: () => void;
  onEditPass: (pass: PassRecordDto) => void;
  onUpdateStatus: (slug: string, nextStatus: PassStatus) => void;
  onDeletePass: (slug: string) => void;
}

const STATUS_META: Record<
  PassStatus,
  { label: string; badgeClass: string }
> = {
  activo: {
    label: "ACTIVO",
    badgeClass:
      "border-bronce-antiguo/60 bg-verde-organico/50 text-bronce-antiguo",
  },
  canjeado: {
    label: "CANJEADO · CHECK-IN",
    badgeClass: "border-emerald-500/50 bg-emerald-950/60 text-emerald-200",
  },
  cancelado: {
    label: "CANCELADO",
    badgeClass: "border-lacre-borgona bg-lacre-borgona/35 text-red-200",
  },
};

function formatDateTimeMx(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function PassHistoryPanel({
  passes,
  loading,
  dbConfigured,
  errorMessage,
  search,
  hotelFilter,
  statusFilter,
  origin,
  activeEditingSlug,
  busySlug,
  onSearchChange,
  onHotelFilterChange,
  onStatusFilterChange,
  onRefresh,
  onEditPass,
  onUpdateStatus,
  onDeletePass,
}: PassHistoryPanelProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(
    null
  );

  const copyShortUrl = async (slug: string) => {
    const relative = `/pase/${slug}`;
    const full = origin ? `${origin}${relative}` : relative;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(full);
      }
      setCopiedSlug(slug);
      window.setTimeout(() => setCopiedSlug(null), 2200);
    } catch {
      setCopiedSlug(null);
    }
  };

  const buildWhatsAppLink = (item: PassRecordDto) => {
    const relative = `/pase/${item.slug}`;
    const full = origin ? `${origin}${relative}` : relative;
    const message = `Hola ${item.destinatario}, ${item.remitente} preparó tu invitación digital de Grupo Orgánico para «El Tiempo Que Nos Debemos» (Folio ${item.folio}). Ábrela aquí: ${full}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className="mt-12 border border-bronce-antiguo/45 bg-tinta-archivo/95 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-bronce-antiguo/25 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
            <Database className="h-3.5 w-3.5" />
            LIBRO DE REGISTRO · NEON POSTGRES
          </span>
          <h2 className="mt-1 font-serif text-2xl font-normal text-papel-algodon sm:text-3xl">
            Historial y Control de Pases Emitidos
          </h2>
          <p className="mt-1 font-sans text-xs font-light text-papel-algodon/70">
            Edita fechas o dedicatorias sin cambiar el enlace, verifica si la
            pareja ya abrió el sello y controla check-ins o cancelaciones.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={!dbConfigured || loading}
          className="inline-flex items-center gap-2 border border-bronce-antiguo/45 bg-tinta-archivo px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo transition-colors hover:border-bronce-antiguo hover:bg-bronce-antiguo hover:text-tinta-archivo disabled:opacity-45"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Sincronizando..." : "Actualizar lista"}</span>
        </button>
      </div>

      {!dbConfigured ? (
        <div className="mt-6 border border-bronce-antiguo/40 bg-verde-organico/20 p-5 text-sm text-papel-algodon/85">
          <p className="font-medium text-bronce-antiguo">
            Falta conectar tu URL de Neon Postgres (`DATABASE_URL`)
          </p>
          <p className="mt-1.5 font-sans text-xs leading-relaxed text-papel-algodon/75">
            El código y esquema Drizzle ya están listos. Agrega{" "}
            <code className="bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-bronce-antiguo">
              DATABASE_URL
            </code>{" "}
            en <code className="bg-black/40 px-1.5 py-0.5 font-mono text-[11px]">.env.local</code>{" "}
            (o vincula Neon en Vercel Storage) y ejecuta{" "}
            <code className="bg-black/40 px-1.5 py-0.5 font-mono text-[11px]">
              npm run db:migrate
            </code>{" "}
            para activar aquí el historial, links cortos y rastreo de apertura.
          </p>
        </div>
      ) : (
        <>
          {/* Barra de búsqueda y filtros */}
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-bronce-antiguo/70" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por folio, pareja o código..."
                className="w-full border border-bronce-antiguo/35 bg-verde-organico/15 py-2.5 pl-10 pr-4 font-sans text-sm text-papel-algodon placeholder:text-papel-algodon/40 focus:border-bronce-antiguo focus:outline-none"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={hotelFilter}
                onChange={(e) => onHotelFilterChange(e.target.value)}
                aria-label="Filtrar pases por hotel"
                className="w-full border border-bronce-antiguo/35 bg-tinta-archivo px-3.5 py-2.5 font-sans text-sm text-papel-algodon focus:border-bronce-antiguo focus:outline-none"
              >
                <option value="todos">Todos los hoteles (5 propiedades)</option>
                {HOTELS.map((h) => (
                  <option key={h.slug} value={h.slug}>
                    {h.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                aria-label="Filtrar pases por estado"
                className="w-full border border-bronce-antiguo/35 bg-tinta-archivo px-3.5 py-2.5 font-sans text-sm text-papel-algodon focus:border-bronce-antiguo focus:outline-none"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="canjeado">Canjeados (Check-in)</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 border border-lacre-borgona bg-lacre-borgona/25 px-4 py-3 font-sans text-xs text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Lista de pases */}
          {passes.length === 0 && !loading ? (
            <div className="mt-6 border border-dashed border-bronce-antiguo/30 py-10 text-center">
              <p className="font-serif text-xl text-papel-algodon/80">
                No hay pases registrados con este filtro todavía
              </p>
              <p className="mt-1 font-sans text-xs text-papel-algodon/55">
                Usa el botón «Guardar en Neon y copiar enlace corto» en el editor
                de arriba para registrar el primer folio.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {passes.map((item) => {
                const hotel = getHotelBySlug(item.hotelSlug);
                const exp =
                  hotel?.experiencias[item.experienciaIndex] ??
                  hotel?.experiencias[0];
                const statusInfo = STATUS_META[item.estado];
                const isEditingThis = activeEditingSlug === item.slug;
                const isBusy = busySlug === item.slug;

                return (
                  <article
                    key={item.id}
                    className={`border p-4 transition-colors sm:p-5 ${
                      isEditingThis
                        ? "border-bronce-antiguo bg-bronce-antiguo/10"
                        : "border-bronce-antiguo/30 bg-black/25 hover:border-bronce-antiguo/55"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      {/* Info principal */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="border border-bronce-antiguo/50 bg-tinta-archivo px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-widest text-bronce-antiguo">
                            {item.folio}
                          </span>
                          <span
                            className={`border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.label}
                          </span>
                          {item.destinoSecreto && (
                            <span className="inline-flex items-center gap-1 border border-lacre-borgona bg-lacre-borgona/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon">
                              <Lock className="h-2.5 w-2.5" />
                              SORPRESA
                            </span>
                          )}
                          {item.openedAt ? (
                            <span className="inline-flex items-center gap-1 border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-200">
                              <Eye className="h-3 w-3" />
                              ABIERTO ({item.openCount}x ·{" "}
                              {formatDateTimeMx(item.openedAt)})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 border border-bronce-antiguo/25 bg-tinta-archivo px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon/55">
                              <EyeOff className="h-3 w-3" />
                              SIN ABRIR
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <h3 className="font-serif text-xl font-medium text-papel-algodon">
                            {item.remitente} → {item.destinatario}
                          </h3>
                          <span className="font-mono text-[11px] text-papel-algodon/55">
                            /pase/{item.slug}
                          </span>
                        </div>

                        <p className="font-sans text-xs text-papel-algodon/80">
                          <strong className="font-medium text-bronce-antiguo">
                            {hotel?.nombre ?? item.hotelSlug}
                          </strong>
                          {exp ? ` · ${exp.titulo}` : ""} · {item.fechaLlegada}
                        </p>

                        {(item.contactoCliente || item.notasConcierge || item.revealAt) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 font-mono text-[10px] text-papel-algodon/65">
                            {item.revealAt && (
                              <span>
                                REVELA: {formatDateTimeMx(item.revealAt)}
                              </span>
                            )}
                            {item.contactoCliente && (
                              <span>CONTACTO: {item.contactoCliente}</span>
                            )}
                            {item.notasConcierge && (
                              <span>NOTA: {item.notasConcierge}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acciones rápidas */}
                      <div className="flex flex-wrap items-center gap-2 lg:max-w-sm lg:justify-end">
                        <button
                          type="button"
                          onClick={() => onEditPass(item)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1.5 border border-bronce-antiguo/55 bg-tinta-archivo px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo transition-colors hover:bg-bronce-antiguo hover:text-tinta-archivo disabled:opacity-50"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>{isEditingThis ? "Editando" : "Editar"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void copyShortUrl(item.slug)}
                          className="inline-flex items-center gap-1.5 border border-bronce-antiguo/40 bg-tinta-archivo px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon/85 transition-colors hover:border-bronce-antiguo hover:text-bronce-antiguo"
                        >
                          {copiedSlug === item.slug ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-300" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Link</span>
                            </>
                          )}
                        </button>

                        <a
                          href={buildWhatsAppLink(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Enviar pase ${item.folio} por WhatsApp`}
                          className="inline-flex items-center gap-1 border border-bronce-antiguo/40 bg-verde-organico/50 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon hover:border-bronce-antiguo"
                        >
                          <MessageCircle className="h-3 w-3 text-bronce-antiguo" />
                          <span>WA</span>
                        </a>

                        <a
                          href={`/pase/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir pase ${item.folio} en nueva pestaña`}
                          className="inline-flex items-center gap-1 border border-bronce-antiguo/40 bg-tinta-archivo px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-papel-algodon/85 hover:border-bronce-antiguo"
                        >
                          <ExternalLink className="h-3 w-3 text-bronce-antiguo" />
                        </a>

                        {item.estado !== "canjeado" && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onUpdateStatus(item.slug, "canjeado")}
                            title="Marcar check-in y hoja firmada en recepción"
                            className="inline-flex items-center gap-1 border border-emerald-500/45 bg-emerald-950/40 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-200 hover:bg-emerald-900/60 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Check-in</span>
                          </button>
                        )}

                        {item.estado !== "cancelado" ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              onUpdateStatus(item.slug, "cancelado")
                            }
                            title="Revocar / cancelar este pase"
                            className="inline-flex items-center gap-1 border border-lacre-borgona bg-lacre-borgona/30 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-red-200 hover:bg-lacre-borgona disabled:opacity-50"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Cancelar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onUpdateStatus(item.slug, "activo")}
                            title="Reactivar este pase"
                            className="inline-flex items-center gap-1 border border-bronce-antiguo/50 bg-tinta-archivo px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-bronce-antiguo hover:bg-bronce-antiguo hover:text-tinta-archivo disabled:opacity-50"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reactivar</span>
                          </button>
                        )}

                        {confirmDeleteSlug === item.slug ? (
                          <div className="inline-flex items-center gap-1 border border-red-500/70 bg-red-950/70 px-2 py-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                setConfirmDeleteSlug(null);
                                onDeletePass(item.slug);
                              }}
                              className="font-mono text-[10px] uppercase tracking-widest text-red-200 hover:underline"
                            >
                              Confirmar
                            </button>
                            <span className="text-red-300/40">/</span>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteSlug(null)}
                              className="font-mono text-[10px] uppercase tracking-widest text-papel-algodon/75 hover:underline"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setConfirmDeleteSlug(item.slug)}
                            aria-label={`Eliminar pase ${item.folio}`}
                            className="inline-flex items-center border border-red-900/60 bg-tinta-archivo p-1.5 text-red-300/75 hover:border-red-500 hover:text-red-200 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

