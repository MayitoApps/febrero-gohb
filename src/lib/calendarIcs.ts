import type { Experience, Hotel, PackingHints } from "@/data/hotels";
import type { PassData } from "@/lib/passCodec";
import {
  describeIsoDate,
  groupContiguousDateSpans,
  normalizeSelectedIsoDates,
  parseIsoDateParts,
} from "@/lib/passDates";

const SPANISH_MONTHS: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatUtcTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}` +
    `${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}T` +
    `${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}` +
    `${pad(date.getUTCSeconds())}Z`
  );
}

function extractCheckInHourMinute(fechaLlegada: string): {
  hour: number;
  minute: number;
} {
  const timeMatch = fechaLlegada.toLowerCase().match(/\b(\d{1,2}):(\d{2})\b/);
  const hour = timeMatch ? Math.min(23, Number(timeMatch[1])) : 15;
  const minute = timeMatch ? Math.min(59, Number(timeMatch[2])) : 0;
  return { hour, minute };
}

export interface CalendarSpan {
  startUtc: Date;
  endUtc: Date;
  label: string;
}

function formatSpanLabel(spanIsos: string[]): string {
  if (spanIsos.length === 0) return "";
  const first = describeIsoDate(spanIsos[0]);
  const last = describeIsoDate(spanIsos[spanIsos.length - 1]);
  if (!first || !last) return spanIsos[0];
  if (spanIsos.length === 1 || first.iso === last.iso) {
    return `${first.weekdayShort} ${first.dayNumber} ${first.monthShort}`;
  }
  return `${first.dayNumber}–${last.dayNumber} ${last.monthShort}`;
}

/**
 * Convierte fechas seleccionadas o texto libre en uno o varios rangos UTC (CDMX UTC-6).
 * Prioriza fechasSeleccionadas si vienen en la invitación; de lo contrario analiza rangos en texto.
 */
export function resolveCalendarSpans(pass: PassData): CalendarSpan[] {
  const { hour: localHour, minute } = extractCheckInHourMinute(
    pass.fechaLlegada
  );
  const selected = normalizeSelectedIsoDates(pass.fechasSeleccionadas ?? []);

  if (selected.length > 0) {
    const spans = groupContiguousDateSpans(selected);
    return spans.map((span) => {
      const startParts = parseIsoDateParts(span[0])!;
      const endParts = parseIsoDateParts(span[span.length - 1])!;
      const startUtc = new Date(
        Date.UTC(
          startParts.year,
          startParts.month - 1,
          startParts.day,
          localHour + 6,
          minute,
          0
        )
      );

      if (span.length === 1) {
        return {
          startUtc,
          endUtc: new Date(startUtc.getTime() + 3 * 60 * 60 * 1000),
          label: formatSpanLabel(span),
        };
      }

      // Para estancias de varios días, finalizar el último día a las 14:00 hrs CDMX
      const endUtc = new Date(
        Date.UTC(endParts.year, endParts.month - 1, endParts.day, 14 + 6, 0, 0)
      );
      return {
        startUtc,
        endUtc:
          endUtc > startUtc
            ? endUtc
            : new Date(startUtc.getTime() + 24 * 60 * 60 * 1000),
        label: formatSpanLabel(span),
      };
    });
  }

  // Fallback para invitaciones anteriores o texto libre (detectando también "12 al 14")
  const lower = pass.fechaLlegada.toLowerCase();
  const yearMatch = lower.match(/\b(202[6-9])\b/);
  const year = yearMatch ? Number(yearMatch[1]) : 2027;

  let month = 2;
  for (const [name, num] of Object.entries(SPANISH_MONTHS)) {
    if (lower.includes(name)) {
      month = num;
      break;
    }
  }

  const withoutTime = lower.replace(/\b\d{1,2}:\d{2}\b/g, "");
  const dayMatches = Array.from(
    withoutTime.matchAll(/\b([1-9]|[12]\d|3[01])\b/g)
  ).map((m) => Number(m[1]));

  const startDay = dayMatches[0] ?? 14;
  const endDay = dayMatches.length > 1 ? dayMatches[dayMatches.length - 1] : null;

  const startUtc = new Date(
    Date.UTC(year, month - 1, startDay, localHour + 6, minute, 0)
  );

  if (endDay && endDay > startDay) {
    const endUtc = new Date(Date.UTC(year, month - 1, endDay, 14 + 6, 0, 0));
    return [{ startUtc, endUtc, label: "" }];
  }

  return [
    {
      startUtc,
      endUtc: new Date(startUtc.getTime() + 3 * 60 * 60 * 1000),
      label: "",
    },
  ];
}

function buildCalendarEventMetadata(
  pass: PassData,
  packingHints: PackingHints,
  hotel?: Hotel | null,
  experiencia?: Experience | null
) {
  const isSecret = pass.destinoSecreto || !hotel || !experiencia;

  const summary = isSecret
    ? "Escapada Secreta · El Tiempo Que Nos Debemos"
    : `El Tiempo Que Nos Debemos · ${hotel.nombre}`;

  const location = isSecret
    ? "Destino Confidencial · Por revelar al viajar"
    : hotel.direccionExacta;

  const description = isSecret
    ? [
        `Folio: ${pass.folio}`,
        `De: ${pass.remitente} para ${pass.destinatario}`,
        `Fechas / Cita: ${pass.fechaLlegada}`,
        `Pista: ${packingHints.vibe}. Clima estimado: ${packingHints.clima}.`,
      ].join("\n")
    : [
        `Folio: ${pass.folio}`,
        `Experiencia: ${experiencia.titulo}`,
        `Fechas / Cita: ${pass.fechaLlegada}`,
        `Dirección: ${hotel.direccionExacta}`,
      ].join("\n");

  return { summary, location, description };
}

export interface GoogleCalendarEventLink {
  label: string;
  url: string;
}

/**
 * Genera enlaces directos para guardar el evento en Google Calendar.
 * Devuelve un enlace por cada rango continuo (normalmente 1 para fin de semana o día único).
 */
export function buildGoogleCalendarEvents(
  pass: PassData,
  packingHints: PackingHints,
  hotel?: Hotel | null,
  experiencia?: Experience | null
): GoogleCalendarEventLink[] {
  const spans = resolveCalendarSpans(pass);
  const { summary, location, description } = buildCalendarEventMetadata(
    pass,
    packingHints,
    hotel,
    experiencia
  );

  return spans.map((span) => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: summary,
      dates: `${formatUtcTimestamp(span.startUtc)}/${formatUtcTimestamp(
        span.endUtc
      )}`,
      details: description,
      location,
      ctz: "America/Mexico_City",
    });

    return {
      label: span.label,
      url: `https://calendar.google.com/calendar/render?${params.toString()}`,
    };
  });
}

export function buildPassIcsContent(
  pass: PassData,
  packingHints: PackingHints,
  hotel?: Hotel | null,
  experiencia?: Experience | null
): string {
  const spans = resolveCalendarSpans(pass);
  const nowUtc = new Date();
  const { summary, location, description } = buildCalendarEventMetadata(
    pass,
    packingHints,
    hotel,
    experiencia
  );

  const uidSafe =
    pass.folio.replace(/[^A-Za-z0-9-]/g, "").toLowerCase() || "go-2027";

  const eventBlocks = spans.flatMap((span, index) => [
    "BEGIN:VEVENT",
    `UID:${uidSafe}-${index + 1}@grupoorganico.mx`,
    `DTSTAMP:${formatUtcTimestamp(nowUtc)}`,
    `DTSTART:${formatUtcTimestamp(span.startUtc)}`,
    `DTEND:${formatUtcTimestamp(span.endUtc)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
  ]);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grupo Organico Hoteles Boutique//El Tiempo Que Nos Debemos 2027//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...eventBlocks,
    "END:VCALENDAR",
  ].join("\r\n");
}
