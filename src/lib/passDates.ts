export interface CampaignDateDay {
  iso: string;
  weekdayShort: string;
  weekdayFull: string;
  dayNumber: string;
  monthShort: string;
}

export interface WeekendPreset {
  id: string;
  label: string;
  sublabel: string;
  dates: string[];
  defaultTime: string;
}

const WEEKDAYS_FULL = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const WEEKDAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const MONTHS_FULL = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const MONTHS_SHORT = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDateParts(
  iso: string
): { year: number; month: number; day: number } | null {
  if (!ISO_DATE_PATTERN.test(iso)) {
    return null;
  }
  const [year, month, day] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function normalizeSelectedIsoDates(dates: string[]): string[] {
  const unique = new Set<string>();
  for (const d of dates) {
    const trimmed = d.trim();
    if (parseIsoDateParts(trimmed)) {
      unique.add(trimmed);
    }
  }
  return Array.from(unique).sort();
}

export function describeIsoDate(iso: string): CampaignDateDay | null {
  const parts = parseIsoDateParts(iso);
  if (!parts) return null;
  const dt = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const dow = dt.getUTCDay();
  return {
    iso,
    weekdayShort: WEEKDAYS_SHORT[dow],
    weekdayFull: WEEKDAYS_FULL[dow],
    dayNumber: String(parts.day),
    monthShort: MONTHS_SHORT[parts.month - 1],
  };
}

export function areDatesContiguous(sortedIsoDates: string[]): boolean {
  if (sortedIsoDates.length <= 1) return true;
  for (let i = 1; i < sortedIsoDates.length; i += 1) {
    const prev = parseIsoDateParts(sortedIsoDates[i - 1]);
    const curr = parseIsoDateParts(sortedIsoDates[i]);
    if (!prev || !curr) return false;
    const prevMs = Date.UTC(prev.year, prev.month - 1, prev.day);
    const currMs = Date.UTC(curr.year, curr.month - 1, curr.day);
    if (currMs - prevMs !== 24 * 60 * 60 * 1000) {
      return false;
    }
  }
  return true;
}

export function groupContiguousDateSpans(sortedIsoDates: string[]): string[][] {
  if (sortedIsoDates.length === 0) return [];
  const spans: string[][] = [[sortedIsoDates[0]]];
  for (let i = 1; i < sortedIsoDates.length; i += 1) {
    const currentSpan = spans[spans.length - 1];
    const prev = parseIsoDateParts(currentSpan[currentSpan.length - 1]);
    const curr = parseIsoDateParts(sortedIsoDates[i]);
    if (prev && curr) {
      const diff =
        Date.UTC(curr.year, curr.month - 1, curr.day) -
        Date.UTC(prev.year, prev.month - 1, prev.day);
      if (diff === 24 * 60 * 60 * 1000) {
        currentSpan.push(sortedIsoDates[i]);
        continue;
      }
    }
    spans.push([sortedIsoDates[i]]);
  }
  return spans;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formatea una o varias fechas YYYY-MM-DD y una hora en un texto editorial legible en español.
 */
export function formatArrivalDatesSummary(
  isoDates: string[],
  timeLabel: string
): string {
  const normalized = normalizeSelectedIsoDates(isoDates);
  const cleanTime = timeLabel.trim() || "15:00 hrs";

  if (normalized.length === 0) {
    return `Viernes 12 de febrero 2027 · ${cleanTime}`;
  }

  if (normalized.length === 1) {
    const p = parseIsoDateParts(normalized[0])!;
    const info = describeIsoDate(normalized[0])!;
    return `${capitalize(info.weekdayFull)} ${p.day} de ${
      MONTHS_FULL[p.month - 1]
    } ${p.year} · ${cleanTime}`;
  }

  const isContiguous = areDatesContiguous(normalized);
  if (isContiguous) {
    const firstIso = normalized[0];
    const lastIso = normalized[normalized.length - 1];
    const p1 = parseIsoDateParts(firstIso)!;
    const p2 = parseIsoDateParts(lastIso)!;
    const i1 = describeIsoDate(firstIso)!;
    const i2 = describeIsoDate(lastIso)!;

    const prefix = normalized.length >= 3 ? "Del " : "";

    if (p1.year === p2.year && p1.month === p2.month) {
      const rangeText = `${prefix}${i1.weekdayFull} ${p1.day} al ${i2.weekdayFull} ${p2.day} de ${
        MONTHS_FULL[p1.month - 1]
      } ${p1.year}`;
      return `${capitalize(rangeText)} · Check-in ${cleanTime}`;
    }

    if (p1.year === p2.year) {
      const rangeText = `${prefix}${i1.weekdayFull} ${p1.day} de ${
        MONTHS_FULL[p1.month - 1]
      } al ${i2.weekdayFull} ${p2.day} de ${MONTHS_FULL[p2.month - 1]} ${
        p1.year
      }`;
      return `${capitalize(rangeText)} · Check-in ${cleanTime}`;
    }

    return `${capitalize(prefix)}${i1.weekdayFull} ${p1.day} de ${
      MONTHS_FULL[p1.month - 1]
    } ${p1.year} al ${i2.weekdayFull} ${p2.day} de ${
      MONTHS_FULL[p2.month - 1]
    } ${p2.year} · Check-in ${cleanTime}`;
  }

  // Múltiples fechas no contiguas (ej. viernes 12 y domingo 14)
  const sameMonthAndYear = normalized.every((iso) => {
    const first = parseIsoDateParts(normalized[0])!;
    const curr = parseIsoDateParts(iso)!;
    return curr.year === first.year && curr.month === first.month;
  });

  if (sameMonthAndYear) {
    const first = parseIsoDateParts(normalized[0])!;
    const labels = normalized.map((iso) => {
      const info = describeIsoDate(iso)!;
      return `${info.weekdayFull} ${info.dayNumber}`;
    });
    const joined =
      labels.slice(0, -1).join(", ") + " y " + labels[labels.length - 1];
    return `${capitalize(joined)} de ${MONTHS_FULL[first.month - 1]} ${
      first.year
    } · ${cleanTime}`;
  }

  const fullLabels = normalized.map((iso) => {
    const p = parseIsoDateParts(iso)!;
    const info = describeIsoDate(iso)!;
    return `${info.weekdayFull} ${p.day} de ${MONTHS_FULL[p.month - 1]} ${
      p.year
    }`;
  });
  const joinedFull =
    fullLabels.slice(0, -1).join(", ") +
    " y " +
    fullLabels[fullLabels.length - 1];
  return `${capitalize(joinedFull)} · ${cleanTime}`;
}

export const CAMPAIGN_WEEK_DAYS: CampaignDateDay[] = [
  "2027-02-11",
  "2027-02-12",
  "2027-02-13",
  "2027-02-14",
  "2027-02-15",
]
  .map((iso) => describeIsoDate(iso)!)
  .filter(Boolean);

export const WEEKEND_PRESETS: WeekendPreset[] = [
  {
    id: "full-weekend",
    label: "Fin de semana completo",
    sublabel: "Vie 12 – Dom 14 Feb",
    dates: ["2027-02-12", "2027-02-13", "2027-02-14"],
    defaultTime: "15:00 hrs",
  },
  {
    id: "extended-weekend",
    label: "Fin de semana largo",
    sublabel: "Vie 12 – Lun 15 Feb",
    dates: ["2027-02-12", "2027-02-13", "2027-02-14", "2027-02-15"],
    defaultTime: "15:00 hrs",
  },
  {
    id: "fri-sat",
    label: "Vie 12 – Sáb 13",
    sublabel: "1 noche · Inicio de puente",
    dates: ["2027-02-12", "2027-02-13"],
    defaultTime: "15:00 hrs",
  },
  {
    id: "sat-sun",
    label: "Sáb 13 – Dom 14",
    sublabel: "Noche de San Valentín",
    dates: ["2027-02-13", "2027-02-14"],
    defaultTime: "15:00 hrs",
  },
  {
    id: "sun-mon",
    label: "Dom 14 – Lun 15",
    sublabel: "Escapada dominical",
    dates: ["2027-02-14", "2027-02-15"],
    defaultTime: "15:00 hrs",
  },
  {
    id: "sun-only",
    label: "Solo Domingo 14",
    sublabel: "Día o cena especial",
    dates: ["2027-02-14"],
    defaultTime: "14:00 hrs",
  },
];

export const ARRIVAL_TIME_OPTIONS = [
  "13:00 hrs",
  "14:00 hrs",
  "15:00 hrs",
  "16:00 hrs",
  "19:00 hrs",
  "20:00 hrs",
];

