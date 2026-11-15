import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const passStatusEnum = pgEnum("pass_status", [
  "activo",
  "canjeado",
  "cancelado",
]);

export type PassStatus = (typeof passStatusEnum.enumValues)[number];

export const passes = pgTable(
  "passes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    folio: text("folio").notNull(),
    remitente: text("remitente").notNull(),
    destinatario: text("destinatario").notNull(),
    hotelSlug: text("hotel_slug").notNull(),
    experienciaIndex: integer("experiencia_index").notNull().default(0),
    fechaLlegada: text("fecha_llegada").notNull(),
    fechasSeleccionadas: jsonb("fechas_seleccionadas")
      .$type<string[]>()
      .notNull()
      .default([]),
    dedicatoria: text("dedicatoria").notNull(),
    destinoSecreto: boolean("destino_secreto").notNull().default(false),
    revealAt: timestamp("reveal_at", { withTimezone: true }),
    estado: passStatusEnum("estado").notNull().default("activo"),
    contactoCliente: text("contacto_cliente"),
    notasConcierge: text("notas_concierge"),
    openedAt: timestamp("opened_at", { withTimezone: true }),
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
    openCount: integer("open_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("passes_folio_idx").on(table.folio),
    index("passes_hotel_idx").on(table.hotelSlug),
    index("passes_estado_idx").on(table.estado),
    index("passes_created_idx").on(table.createdAt),
  ]
);

export type PassRecord = InferSelectModel<typeof passes>;
export type NewPassRecord = InferInsertModel<typeof passes>;

export interface PassRecordDto {
  id: string;
  slug: string;
  folio: string;
  remitente: string;
  destinatario: string;
  hotelSlug: string;
  experienciaIndex: 0 | 1;
  fechaLlegada: string;
  fechasSeleccionadas: string[];
  dedicatoria: string;
  destinoSecreto: boolean;
  revealAt: string | null;
  estado: PassStatus;
  contactoCliente: string | null;
  notasConcierge: string | null;
  openedAt: string | null;
  lastOpenedAt: string | null;
  openCount: number;
  createdAt: string;
  updatedAt: string;
}

