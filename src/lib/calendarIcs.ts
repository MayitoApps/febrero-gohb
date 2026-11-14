import type { Experience, Hotel, PackingHints } from "@/data/hotels";
import type { PassData } from "@/lib/passCodec";

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

/**
 * Extrae una fecha y hora aproximada a partir del texto libre de llegada (hora CDMX UTC-6).
 */
function parseSpanishArrivalDate(fechaLlegada: string): {
  startUtc: Date;
  endUtc: Date;
} {
  const lower = fechaLlegada.toLowerCase();

  const yearMatch = lower.match(/\b(202[6-9])\b/);
  const year = yearMatch ? Number(yearMatch[1]) : 2027;

  let month = 2; // Febrero por defecto
  for (const [name, num] of Object.entries(SPANISH_MONTHS)) {
    if (lower.includes(name)) {
      month = num;
      break;
    }
  }

  // Buscar día del mes (1-31) excluyendo horas tipo HH:MM
  const withoutTime = lower.replace(/\b\d{1,2}:\d{2}\b/g, "");
  const dayMatch = withoutTime.match(/\b([1-9]|[12]\d|3[01])\b/);
  const day = dayMatch ? Number(dayMatch[1]) : 14;

  const timeMatch = lower.match(/\b(\d{1,2}):(\d{2})\b/);
  const localHour = timeMatch ? Math.min(23, Number(timeMatch[1])) : 15;
  const minute = timeMatch ? Math.min(59, Number(timeMatch[2])) : 0;

  // CDMX / Centro de México es UTC-6 permanente
  const startUtc = new Date(
    Date.UTC(year, month - 1, day, localHour + 6, minute, 0)
  );
  const endUtc = new Date(startUtc.getTime() + 3 * 60 * 60 * 1000);

  return { startUtc, endUtc };
}

export function buildPassIcsContent(
  pass: PassData,
  packingHints: PackingHints,
  hotel?: Hotel | null,
  experiencia?: Experience | null
): string {
  const { startUtc, endUtc } = parseSpanishArrivalDate(pass.fechaLlegada);
  const nowUtc = new Date();

  const isSecret = pass.destinoSecreto || !hotel || !experiencia;

  const summary = isSecret
    ? "Escapada Secreta · El Tiempo Que Nos Debemos"
    : `El Tiempo Que Nos Debemos · ${hotel.nombre}`;

  const location = isSecret
    ? "Destino Confidencial · Por revelar al viajar"
    : hotel.direccionExacta;

  const rawDescription = isSecret
    ? [
        `Folio: ${pass.folio}`,
        `De: ${pass.remitente} para ${pass.destinatario}`,
        `Cita: ${pass.fechaLlegada}`,
        `Pista: ${packingHints.vibe}. Clima estimado: ${packingHints.clima}.`,
      ].join("\n")
    : [
        `Folio: ${pass.folio}`,
        `Experiencia: ${experiencia.titulo}`,
        `Cita: ${pass.fechaLlegada}`,
        `Dirección: ${hotel.direccionExacta}`,
      ].join("\n");

  const uidSafe =
    pass.folio.replace(/[^A-Za-z0-9-]/g, "").toLowerCase() || "go-2027";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grupo Organico Hoteles Boutique//El Tiempo Que Nos Debemos 2027//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uidSafe}@grupoorganico.mx`,
    `DTSTAMP:${formatUtcTimestamp(nowUtc)}`,
    `DTSTART:${formatUtcTimestamp(startUtc)}`,
    `DTEND:${formatUtcTimestamp(endUtc)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(rawDescription)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
