import type { Metadata } from "next";
import PassGeneratorClient from "@/components/PassGeneratorClient";

export const metadata: Metadata = {
  title: "Generador de Invitaciones Digitales | Grupo Orgánico Hoteles Boutique",
  description:
    "Herramienta interna de Concierge para generar y administrar invitaciones digitales personalizadas.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GeneradorPage() {
  return <PassGeneratorClient />;
}

