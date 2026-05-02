export type CoworkingSpace = {
  id: string;
  name: string;
  district: string;
  address: string;
  areaLabel: string;
  capacity: string;
  priceHint: string;
  availability: string;
  imageGradient: string;
  highlights: string[];
};

export const mockCoworkingSpaces: CoworkingSpace[] = [
  {
    id: "miraflores-meeting-studio",
    name: "Meeting Studio Miraflores",
    district: "Miraflores",
    address: "Av. Jose Pardo 601, cerca al Parque Kennedy",
    areaLabel: "Zona centrica",
    capacity: "2 a 6 personas",
    priceHint: "Desde S/ 35 por hora",
    availability: "Salas disponibles hoy",
    imageGradient: "from-primary/90 via-primary-light/80 to-accent/80",
    highlights: ["Sala privada", "Wi-Fi premium", "Cafe incluido"],
  },
  {
    id: "san-isidro-business-lounge",
    name: "Business Lounge San Isidro",
    district: "San Isidro",
    address: "Calle Las Begonias 415, zona financiera",
    areaLabel: "Ejecutivo",
    capacity: "2 a 8 personas",
    priceHint: "Desde S/ 45 por hora",
    availability: "Ideal para reuniones formales",
    imageGradient: "from-primary-dark/90 via-primary/80 to-slate-900/80",
    highlights: ["Recepcion", "Pizarra", "Privacidad"],
  },
  {
    id: "barranco-creative-hub",
    name: "Creative Hub Barranco",
    district: "Barranco",
    address: "Av. Grau 320, a pasos del Malecon",
    areaLabel: "Creativo",
    capacity: "2 a 5 personas",
    priceHint: "Desde S/ 30 por hora",
    availability: "Ambiente relajado para idear",
    imageGradient: "from-accent/90 via-orange-400/80 to-primary/80",
    highlights: ["Espacio inspirador", "Zona cafe", "Pet friendly"],
  },
];
