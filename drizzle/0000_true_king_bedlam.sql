CREATE TYPE "public"."pass_status" AS ENUM('activo', 'canjeado', 'cancelado');--> statement-breakpoint
CREATE TABLE "passes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"folio" text NOT NULL,
	"remitente" text NOT NULL,
	"destinatario" text NOT NULL,
	"hotel_slug" text NOT NULL,
	"experiencia_index" integer DEFAULT 0 NOT NULL,
	"fecha_llegada" text NOT NULL,
	"fechas_seleccionadas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dedicatoria" text NOT NULL,
	"destino_secreto" boolean DEFAULT false NOT NULL,
	"reveal_at" timestamp with time zone,
	"estado" "pass_status" DEFAULT 'activo' NOT NULL,
	"contacto_cliente" text,
	"notas_concierge" text,
	"opened_at" timestamp with time zone,
	"last_opened_at" timestamp with time zone,
	"open_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "passes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "passes_folio_idx" ON "passes" USING btree ("folio");--> statement-breakpoint
CREATE INDEX "passes_hotel_idx" ON "passes" USING btree ("hotel_slug");--> statement-breakpoint
CREATE INDEX "passes_estado_idx" ON "passes" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "passes_created_idx" ON "passes" USING btree ("created_at");