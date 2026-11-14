export type FilterCategory =
  | "Todos"
  | "Escapadas de Carretera"
  | "Experiencias en CDMX";

export interface Experience {
  id: string;
  titulo: string;
  enfoque: string;
  badgeTipo: "nocturno" | "diurno";
  descripcionEmotiva: string;
  incluyeTekstCompleto: string;
  incluyeLista: string[];
  imagen: string;
}

export interface PackingHints {
  clima: string;
  equipaje: string;
  vibe: string;
}

export interface Hotel {
  slug: string;
  nombre: string;
  ubicacion: string;
  direccionExacta: string;
  googleMapsUrl: string;
  atmosfera: string;
  categoria: Exclude<FilterCategory, "Todos">;
  foliosDisponibles: number;
  foliosTotales: number;
  foliosTexto: string;
  coordenadasEditorial: string;
  codigoArchivo: string;
  resumenEditorial: string;
  imagenPrincipal: string;
  packingHints: PackingHints;
  experiencias: Experience[];
}

export const CONCIERGE_PIN = "ORGANICO2027";
export const WHATSAPP_NUMBER = "525574555091";
export const WHATSAPP_DISPLAY = "+52 55 7455 5091";

export function buildExperienceWhatsAppUrl(
  hotelNombre: string,
  experienciaTitulo: string
): string {
  const mensajePersonalizado = `Hola Grupo Orgánico, me interesa apartar un folio de la campaña 'El Tiempo Que Nos Debemos' para la experiencia '${experienciaTitulo}' en ${hotelNombre}. ¿Me podrían compartir disponibilidad y pasos para reservar?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    mensajePersonalizado
  )}`;
}

export function buildConciergeWhatsAppUrl(hotelNombre?: string): string {
  const mensaje = hotelNombre
    ? `Hola Concierge de Grupo Orgánico, estoy explorando las experiencias de 'El Tiempo Que Nos Debemos' en ${hotelNombre} (12–14 Feb 2027) y me gustaría recibir atención personalizada.`
    : `Hola Concierge de Grupo Orgánico, me interesa conocer más sobre los folios disponibles de la campaña 'El Tiempo Que Nos Debemos' (12–14 Feb 2027).`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

export const HOTELS: Hotel[] = [
  {
    slug: "ajusco",
    nombre: "Ajusco",
    ubicacion: "Bosque del Ajusco, CDMX",
    direccionExacta: "San Miguel Ajusco, Tlalpan, Ciudad de México, CDMX",
    googleMapsUrl:
      "https://maps.google.com/?q=Organico+Hotel+Boutique+Ajusco",
    atmosfera: "Bosque, Chimenea y Montaña",
    categoria: "Escapadas de Carretera",
    foliosDisponibles: 8,
    foliosTotales: 20,
    foliosTexto: "8 de 20",
    coordenadasEditorial: "19°12′N · 99°15′O · 3,100 MSNM",
    codigoArchivo: "ACTA-AJU-2027/28",
    resumenEditorial:
      "Un refugio de madera, piedra volcánica y neblina alta donde el crepitar de la leña reemplaza cualquier notificación. Diseñado para quienes buscan frío de montaña y calor de chimenea sin cruzar medio país.",
    imagenPrincipal: "/images/hoteles/ajusco-main.webp",
    packingHints: {
      clima: "Frío de montaña (6°C – 16°C)",
      equipaje:
        "Abrigo térmico, suéteres tejidos y calzado cómodo para bosque",
      vibe: "Chimenea, neblina y desconexión total",
    },
    experiencias: [
      {
        id: "ajusco-vigilia",
        titulo: "Vigilia frente al Fuego",
        enfoque: "Íntimo / Nocturno",
        badgeTipo: "nocturno",
        descripcionEmotiva:
          "Una noche para detener el ruido de la ciudad entre pinos y neblina. Disfruten de una estancia privada con chimenea encendida, cena maridaje a la luz de las velas y vino antes de firmar su pacto bajo las estrellas.",
        incluyeTekstCompleto:
          "1 o 2 noches de hospedaje en suite con chimenea, cena maridaje privada de 3 tiempos, vino, link de invitación personalizada al confirmar, firma de hoja personalizada en recepción y beneficio de regreso en feb 2028 (25% off + brindis).",
        incluyeLista: [
          "1 o 2 noches de hospedaje en suite con chimenea",
          "Cena maridaje privada de 3 tiempos a la luz de las velas",
          "Brindis nocturno con vino",
          "Link con invitación digital personalizada al confirmar su reserva",
          "Firma de hoja personalizada en recepción (resguardada por el hotel para otorgar 25% off + brindis al regresar en feb 2028)",
        ],
        imagen: "/images/hoteles/ajusco-exp-1.webp",
      },
      {
        id: "ajusco-manana",
        titulo: "Mañana sin Reloj en el Bosque",
        enfoque: "Diurno / Sensorial",
        badgeTipo: "diurno",
        descripcionEmotiva:
          "Despierten sin alarmas rodeados de silencio natural. Un desayuno rústico servido en su terraza privada, cabalgata guiada entre el bosque y café de olla recién hecho para escribir con calma lo que prometen vivir juntos el próximo año.",
        incluyeTekstCompleto:
          "Hospedaje con late checkout dominical (4:00 PM), desayuno rústico en terraza privada, cabalgata guiada por el bosque, link de invitación personalizada al confirmar, firma de hoja personalizada en recepción y beneficio de regreso en feb 2028 (25% off + brindis).",
        incluyeLista: [
          "Hospedaje con late checkout dominical garantizado (4:00 PM)",
          "Desayuno rústico servido en su terraza privada con café de olla",
          "Cabalgata guiada entre senderos privados del bosque",
          "Link con invitación digital personalizada al confirmar su reserva",
          "Firma de hoja personalizada en recepción (resguardada por el hotel para otorgar 25% off + brindis al regresar en feb 2028)",
        ],
        imagen: "/images/hoteles/ajusco-exp-2.webp",
      },
    ],
  },
  {
    slug: "valle-de-bravo",
    nombre: "Valle de Bravo",
    ubicacion: "Valle de Bravo, Estado de México",
    direccionExacta:
      "Carretera del Manguito 121, 51200 Valle de Bravo, Estado de México",
    googleMapsUrl:
      "https://maps.google.com/?q=Carretera+del+Manguito+121,+Valle+de+Bravo",
    atmosfera: "Lago, Kayak y Pinos",
    categoria: "Escapadas de Carretera",
    foliosDisponibles: 6,
    foliosTotales: 20,
    foliosTexto: "6 de 20",
    coordenadasEditorial: "19°11′N · 100°07′O · LAGO & BOSQUE",
    codigoArchivo: "ACTA-VDB-2027/28",
    resumenEditorial:
      "Entre el espejo de agua al atardecer y la espesura de los pinos altos, el viento marca un compás distinto. Una propiedad concebida para mirar el horizonte sin prisa y dejar por escrito el regreso.",
    imagenPrincipal: "/images/hoteles/valle-main.webp",
    packingHints: {
      clima: "Templado fresco al atardecer (11°C – 22°C)",
      equipaje: "Rompevientos ligero, lentes de sol y calzado cómodo",
      vibe: "Atardecer en kayak y aire de pinos",
    },
    experiencias: [
      {
        id: "valle-horizonte",
        titulo: "Horizonte Detenido",
        enfoque: "Íntimo / Nocturno",
        badgeTipo: "nocturno",
        descripcionEmotiva:
          "Cuando el sol cae sobre el lago, el tiempo parece suspenderse. Recorran el lago en kayak al atardecer con vino espumoso y regresen a una cena íntima donde dejarán por escrito su promesa de volver a este mismo horizonte en 2028.",
        incluyeTekstCompleto:
          "Hospedaje boutique, travesía en kayak al atardecer con tabla de quesos y vino espumoso, cena íntima, link de invitación personalizada al confirmar, firma de hoja personalizada en recepción y beneficio de regreso en feb 2028 (25% off + brindis).",
        incluyeLista: [
          "Hospedaje en suite boutique con vista o terraza",
          "Travesía en kayak al atardecer con tabla de quesos y vino espumoso",
          "Cena íntima de autor al regresar a tierra",
          "Link con invitación digital personalizada al confirmar su reserva",
          "Firma de hoja personalizada en recepción (resguardada por el hotel para otorgar 25% off + brindis al regresar en feb 2028)",
        ],
        imagen: "/images/hoteles/valle-exp-1.webp",
      },
      {
        id: "valle-refugio",
        titulo: "Refugio entre Pinos",
        enfoque: "Diurno / Sensorial",
        badgeTipo: "diurno",
        descripcionEmotiva:
          "Un montaje editorial escondido entre los árboles, lejos de cualquier multitud. Una canasta gourmet, coctelería botánica y una mañana lenta para conversar sin pantallas sobre todo lo que construirán en los próximos 365 días.",
        incluyeTekstCompleto:
          "Hospedaje boutique, picnic privado en el bosque con canasta gourmet y mixología, desayuno tardío en habitación, link de invitación personalizada al confirmar, firma de hoja personalizada en recepción y beneficio de regreso en feb 2028 (25% off + brindis).",
        incluyeLista: [
          "Hospedaje en suite boutique rodeada de bosque",
          "Picnic editorial privado entre los pinos con canasta gourmet y mixología botánica",
          "Desayuno tardío servido en la intimidad de su habitación",
          "Link con invitación digital personalizada al confirmar su reserva",
          "Firma de hoja personalizada en recepción (resguardada por el hotel para otorgar 25% off + brindis al regresar en feb 2028)",
        ],
        imagen: "/images/hoteles/valle-exp-2.jpg",
      },
    ],
  },
  {
    slug: "tepoztlan",
    nombre: "Tepoztlán",
    ubicacion: "Tepoztlán, Morelos",
    direccionExacta:
      "C. Netzahualcóyotl 47, Barrio de Santo Domingo, 62520 Tepoztlán, Mor.",
    googleMapsUrl:
      "https://maps.google.com/?q=C.+Netzahualc%C3%B3yotl+47,+Santo+Domingo,+62520+Tepoztl%C3%A1n,+Mor.",
    atmosfera: "Místico y Jardines",
    categoria: "Escapadas de Carretera",
    foliosDisponibles: 9,
    foliosTotales: 20,
    foliosTexto: "9 de 20",
    coordenadasEditorial: "18°59′N · 99°05′O · VALLE SAGRADO",
    codigoArchivo: "ACTA-TEP-2027/28",
    resumenEditorial:
      "Al pie de los acantilados de piedra cobriza, jardines endémicos y silencio de montaña enmarcan una estancia contemplativa. El escenario ideal para convertir una promesa de pareja en un ritual tangible.",
    imagenPrincipal: "/images/hoteles/tepoztlan-main.jpg",
    packingHints: {
      clima: "Cálido de día, fresco de noche (14°C – 26°C)",
      equipaje:
        "Ropa fresca de lino o algodón, traje de baño y suéter ligero",
      vibe: "Jardines, bienestar y calma mística",
    },
    experiencias: [
      {
        id: "tepoztlan-ritual",
        titulo: "Ritual de Presente y Futuro",
        enfoque: "Íntimo / Nocturno",
        badgeTipo: "nocturno",
        descripcionEmotiva:
          "Al pie del Tepozteco, el tiempo tiene otro ritmo. Disfruten de una tarde de desconexión con un masaje relajante en pareja y una cena iluminada por velas para dejar firmada su cita del próximo año.",
        incluyeTekstCompleto:
          "Hospedaje boutique, masaje relajante en pareja (50 min), cena romántica, link de invitación personalizada al confirmar, firma de hoja personalizada en recepción y beneficio de regreso en feb 2028 (25% off + brindis).",
        incluyeLista: [
          "Hospedaje boutique con vista a los jardines y montaña",
          "Masaje relajante en pareja de 50 minutos",
          "Cena romántica a la luz de las velas",
          "Link con invitación digital personalizada al confirmar su reserva",
          "Firma de hoja personalizada en recepción (resguardada por el hotel para otorgar 25% off + brindis al regresar en feb 2028)",
        ],
        imagen: "/images/hoteles/tepoztlan-exp-1.jpg",
      },
      {
        id: "tepoztlan-jardin",
        titulo: "Jardín de las Promesas",
        enfoque: "Diurno / Sensorial",
        badgeTipo: "diurno",
        descripcionEmotiva:
          "Una escapada de fin de semana diseñada para respirar profundo entre vegetación endémica. Desayuno orgánico en jardín privado, cata y brindis de vino, y salida tardía el domingo para alargar el descanso.",
        incluyeTekstCompleto:
          "Hospedaje boutique con late checkout dominical (4:00 PM), desayuno orgánico en jardín privado, cata y brindis de vino, link de invitación personalizada al confirmar, firma de hoja personalizada en recepción y beneficio de regreso en feb 2028 (25% off + brindis).",
        incluyeLista: [
          "Hospedaje boutique con late checkout dominical (4:00 PM)",
          "Desayuno orgánico servido en jardín privado",
          "Cata y brindis de vino",
          "Link con invitación digital personalizada al confirmar su reserva",
          "Firma de hoja personalizada en recepción (resguardada por el hotel para otorgar 25% off + brindis al regresar en feb 2028)",
        ],
        imagen: "/images/hoteles/tepoztlan-exp-2.jpg",
      },
    ],
  },
  {
    slug: "frontera-49",
    nombre: "Frontera 49",
    ubicacion: "Roma Norte, CDMX",
    direccionExacta:
      "Frontera 49, Roma Norte, Cuauhtémoc, 06700 Ciudad de México, CDMX",
    googleMapsUrl:
      "https://maps.google.com/?q=Frontera+49,+Roma+Nte.,+Cuauht%C3%A9moc,+06700+Ciudad+de+M%C3%A9xico,+CDMX",
    atmosfera: "Arquitectura y Barrio Urbano",
    categoria: "Experiencias en CDMX",
    foliosDisponibles: 7,
    foliosTotales: 20,
    foliosTexto: "7 de 20",
    coordenadasEditorial: "19°25′N · 99°09′O · ROMA NORTE",
    codigoArchivo: "ACTA-F49-2027/28",
    resumenEditorial:
      "Una casona de época restaurada con rigor contemporáneo en el corazón de la Roma Norte. Techos altos, diseño arquitectónico y mixología de autor para desaparecer del vértigo citadino sin salir de la ciudad.",
    imagenPrincipal: "/images/hoteles/frontera-main.png",
    packingHints: {
      clima: "Templado urbano (13°C – 23°C)",
      equipaje:
        "Estilo casual-elegante para caminar y cenar en la ciudad",
      vibe: "Arquitectura, diseño y vida de barrio en la Roma",
    },
    experiencias: [
      {
        id: "frontera-pausa",
        titulo: "Pausa Urbana de Autor",
        enfoque: "Íntimo / Nocturno",
        badgeTipo: "nocturno",
        descripcionEmotiva:
          "No hace falta salir de la ciudad para desaparecer del ruido. Una velada íntima en nuestra casona de diseño en la Roma Norte con clase de mixología para dos, cena privada y la firma de su hoja personalizada al llegar.",
        incluyeTekstCompleto:
          "Clase de mixología para dos, cena íntima para dos, link de invitación personalizada al confirmar, firma de hoja personalizada en recepción y beneficio de regreso en feb 2028 (25% off + brindis).",
        incluyeLista: [
          "Clase de mixología para dos",
          "Cena íntima para dos personas",
          "Link con invitación digital personalizada al confirmar su reserva",
          "Firma de hoja personalizada en recepción (resguardada por el hotel para otorgar 25% off + brindis al regresar en feb 2028)",
        ],
        imagen: "/images/hoteles/frontera-exp-1.jpg",
      },
    ],
  },
  {
    slug: "quinta-soledad",
    nombre: "Centro Cultural Quinta Soledad",
    ubicacion: "Tlalpan, CDMX",
    direccionExacta:
      "Calle Moneda 15, Tlalpan Centro I, 14000 Ciudad de México, CDMX",
    googleMapsUrl:
      "https://maps.google.com/?q=Calle+Moneda+15,+Tlalpan+Centro+I,+14000+Ciudad+de+M%C3%A9xico,+CDMX",
    atmosfera: "Jardines Históricos y Arte",
    categoria: "Experiencias en CDMX",
    foliosDisponibles: 10,
    foliosTotales: 20,
    foliosTexto: "10 de 20",
    coordenadasEditorial: "19°17′N · 99°10′O · TLALPAN HISTÓRICO",
    codigoArchivo: "ACTA-CQS-2027/28",
    resumenEditorial:
      "Un recinto patrimonial de árboles centenarios, salones de arte y jardines amurallados en el sur de la Ciudad de México. Alta gastronomía y solemnidad arquitectónica para celebrar sin salir de la capital.",
    imagenPrincipal: "/images/hoteles/quinta-main.png",
    packingHints: {
      clima: "Templado de jardín (14°C – 24°C)",
      equipaje:
        "Vestimenta smart-casual cómoda para jardín (evitar tacón de aguja)",
      vibe: "Arte, historia y gastronomía al aire libre",
    },
    experiencias: [
      {
        id: "quinta-velada",
        titulo: "Velada en los Jardines del Tiempo",
        enfoque: "Experiencia Nocturna (Sáb 13 o Dom 14)",
        badgeTipo: "nocturno",
        descripcionEmotiva:
          "Una noche irrepetible entre árboles centenarios, arquitectura histórica y luz tenue de velas en el sur de la ciudad. Menú degustación de 4 tiempos con maridaje y el compromiso escrito de volver a encontrarse aquí en 2028.",
        incluyeTekstCompleto:
          "Mesa privada en jardines iluminados, menú degustación de 4 tiempos con maridaje, copa de bienvenida, link de invitación personalizada al confirmar, firma de hoja personalizada en recepción y beneficio de regreso en feb 2028 (25% off + brindis).",
        incluyeLista: [
          "Mesa privada entre jardines históricos iluminados por velas",
          "Menú degustación de autor de 4 tiempos con maridaje",
          "Copa de bienvenida al cruzar el pórtico de la Quinta",
          "Link con invitación digital personalizada al confirmar su reserva",
          "Firma de hoja personalizada en recepción (resguardada por el hotel para otorgar 25% off + brindis al regresar en feb 2028)",
        ],
        imagen: "/images/hoteles/quinta-exp-1.webp",
      },
      {
        id: "quinta-banquete",
        titulo: "Banquete Dominical de los Pactos",
        enfoque: "Experiencia de Día (Domingo 14 de Feb)",
        badgeTipo: "diurno",
        descripcionEmotiva:
          "Celebren el domingo 14 de febrero a plena luz del día en nuestros jardines históricos. Comida maridaje de autor, recorrido histórico por la Quinta Soledad y brindis de cierre para dejar firmada su cita del 2028.",
        incluyeTekstCompleto:
          "Comida maridaje dominical en jardín, recorrido histórico por la Quinta Soledad, brindis de honor, link de invitación personalizada al confirmar, firma de hoja personalizada en recepción y beneficio de regreso en feb 2028 (25% off + brindis).",
        incluyeLista: [
          "Comida maridaje dominical de autor en los jardines de la Quinta",
          "Recorrido histórico por la Quinta Soledad",
          "Brindis de honor de cierre",
          "Link con invitación digital personalizada al confirmar su reserva",
          "Firma de hoja personalizada en recepción (resguardada por el hotel para otorgar 25% off + brindis al regresar en feb 2028)",
        ],
        imagen: "/images/hoteles/quinta-exp-2.png",
      },
    ],
  },
];

export const FAQ_ITEMS = [
  {
    pregunta:
      "¿Al firmar la hoja en recepción ya nos cobran la reservación de 2028?",
    respuesta:
      "No. Hoy únicamente reservan su experiencia seleccionada para febrero de 2027 (del 12 al 14 de febrero). La hoja personalizada que firman en recepción el día de su llegada no genera ningún cargo futuro automático: el hotel guarda las hojas para el próximo año y, si deciden regresar en febrero de 2028, se les otorga directamente el beneficio de 25% de tarifa preferencial y brindis de bienvenida.",
  },
  {
    pregunta: "¿Qué pasa si solo tenemos libre el domingo 14 de febrero?",
    respuesta:
      "Diseñamos alternativas específicamente para aprovechar que el 14 de febrero de 2027 cae en domingo. En CDMX (Frontera 49 en la Roma Norte y Centro Cultural Quinta Soledad en Tlalpan) pueden vivir experiencias gastronómicas, de mixología e históricas sin requerir hospedaje; y nuestras escapadas de carretera en Ajusco y Tepoztlán ofrecen esquemas con late checkout dominical a las 4:00 PM.",
  },
  {
    pregunta: "¿Cómo recibo el regalo para dárselo a mi pareja antes del viaje?",
    respuesta:
      "En cuanto quede confirmada tu reserva con nuestro Concierge vía WhatsApp, te daremos un link con su invitación personalizada para ese día. Podrás compartirle el enlace a tu pareja hoy mismo para sorprenderla antes de que llegue la fecha de su experiencia.",
  },
];

export function getHotelBySlug(slug: string): Hotel | undefined {
  return HOTELS.find((hotel) => hotel.slug === slug);
}

export function getOtherHotels(currentSlug: string): Hotel[] {
  return HOTELS.filter((hotel) => hotel.slug !== currentSlug);
}
