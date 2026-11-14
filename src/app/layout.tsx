import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "El Tiempo Que Nos Debemos · 14 de Febrero 2027 | Grupo Orgánico Hoteles Boutique",
    template: "%s | El Tiempo Que Nos Debemos · Grupo Orgánico",
  },
  description:
    "No celebres lo que ya pasó. Este 12 al 14 de febrero de 2027 escapa de la prisa en nuestras 5 propiedades boutique, recibe un link con tu invitación personalizada, firma tu hoja en recepción y obtén 25% de tarifa preferencial y brindis al regresar en febrero de 2028.",
  keywords: [
    "Grupo Orgánico Hoteles Boutique",
    "14 de febrero 2027",
    "El Tiempo Que Nos Debemos",
    "escapada romántica México",
    "Ajusco",
    "Valle de Bravo",
    "Tepoztlán",
    "Roma Norte",
    "Tlalpan",
  ],
  openGraph: {
    title: "El Tiempo Que Nos Debemos · 12–14 Feb 2027 | Grupo Orgánico",
    description:
      "Escapa de la prisa este fin de semana de febrero 2027, firma tu hoja personalizada en recepción y obtén un 25% de tarifa preferencial + brindis de bienvenida al regresar en febrero de 2028.",
    type: "website",
    locale: "es_MX",
    siteName: "Grupo Orgánico Hoteles Boutique",
    images: [
      {
        url: "/images/hoteles/ajusco-main.webp",
        width: 1200,
        height: 630,
        alt: "El Tiempo Que Nos Debemos - Grupo Orgánico Hoteles Boutique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "El Tiempo Que Nos Debemos · 14 de Febrero 2027 | Grupo Orgánico",
    description:
      "Edición Limitada: 20 pactos por propiedad. Escapa este 12–14 de febrero de 2027 y deja firmada tu cita para febrero de 2028.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-tinta-archivo text-papel-algodon antialiased selection:bg-bronce-antiguo selection:text-tinta-archivo">
        {children}
      </body>
    </html>
  );
}
