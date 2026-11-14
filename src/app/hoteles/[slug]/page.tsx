import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import FaqAndFooter from "@/components/FaqAndFooter";
import HotelDetailClient from "@/components/HotelDetailClient";
import { HOTELS, getHotelBySlug, getOtherHotels } from "@/data/hotels";

interface HotelPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return HOTELS.map((hotel) => ({
    slug: hotel.slug,
  }));
}

export async function generateMetadata({
  params,
}: HotelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hotel = getHotelBySlug(slug);

  if (!hotel) {
    return {
      title: "Propiedad no encontrada",
    };
  }

  const experienciasNombres = hotel.experiencias
    .map((exp) => `"${exp.titulo}"`)
    .join(" y ");
  const title = `${hotel.nombre} (${hotel.ubicacion}) · El Tiempo Que Nos Debemos 2027`;
  const description = `Quedan ${hotel.foliosDisponibles} de ${hotel.foliosTotales} folios en ${hotel.nombre}: ${experienciasNombres}. Incluye link de invitación personalizada al confirmar, firma de hoja personalizada en recepción y beneficio de 25% off + brindis al regresar en febrero 2028.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      siteName: "Grupo Orgánico Hoteles Boutique",
      images: [
        {
          url: hotel.imagenPrincipal,
          width: 1200,
          height: 630,
          alt: `${hotel.nombre} - ${hotel.atmosfera}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [hotel.imagenPrincipal],
    },
  };
}

export default async function HotelDetailPage({ params }: HotelPageProps) {
  const { slug } = await params;
  const hotel = getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  const otherHotels = getOtherHotels(hotel.slug);

  return (
    <div className="flex min-h-screen flex-col bg-tinta-archivo text-papel-algodon">
      <Navbar variant="property" />
      <main className="flex-1">
        <HotelDetailClient hotel={hotel} otherHotels={otherHotels} />
      </main>
      <FaqAndFooter />
    </div>
  );
}
