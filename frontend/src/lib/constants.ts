export const COLORS = {
  primary: "#6C63FF",
  accent: "#C8F135",
  darkBackground: "#1A1A2E",
  lightBackground: "#F5F5FF",
  textOnDark: "#FFFFFF",
  textOnLight: "#1A1A2E",
} as const;

export type CategoryId =
  | "programacion"
  | "diseno"
  | "marketing"
  | "idiomas"
  | "video_foto"
  | "otros";

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  freelancerCount: number;
};

export const CATEGORIES: Category[] = [
  { id: "programacion", label: "Programación", emoji: "💻", freelancerCount: 142 },
  { id: "diseno", label: "Diseño", emoji: "🎨", freelancerCount: 98 },
  { id: "marketing", label: "Marketing", emoji: "📣", freelancerCount: 76 },
  { id: "idiomas", label: "Idiomas", emoji: "🌍", freelancerCount: 54 },
  { id: "video_foto", label: "Video/Foto", emoji: "🎬", freelancerCount: 61 },
  { id: "otros", label: "Otros", emoji: "✨", freelancerCount: 69 },
];

export const LIMA_DISTRICTS = [
  "Todos",
  "Miraflores",
  "San Isidro",
  "Barranco",
  "Surco",
  "La Molina",
  "San Borja",
  "Jesús María",
  "Lince",
  "Magdalena",
  "Pueblo Libre",
  "Los Olivos",
  "San Miguel",
] as const;

export type LimaDistrict = (typeof LIMA_DISTRICTS)[number];
