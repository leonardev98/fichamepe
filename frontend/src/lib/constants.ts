import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  FileText,
  Grid,
  Languages,
  Monitor,
  Music,
  Palette,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";

/** Logo del sitio (S3, lectura pública). */
export const SITE_LOGO_URL =
  "https://fichamepe-assets-prod.s3.us-east-2.amazonaws.com/logo-fichamepe.png";

/** Favicon / icono de pestaña (SVG en S3). */
export const SITE_FAVICON_SVG_URL =
  "https://fichamepe-assets-prod.s3.us-east-2.amazonaws.com/logo+peque%C3%B1o.svg";

/** Frases cortas de marca (reutilizar en hero, secciones, footer, etc.). */
export const SITE_TAGLINES = [
  "Nunca verás lo mismo dos veces.",
  "Acá hay talento.",
  "Alguien ya lo hace.",
  "Deja de buscar, empieza a encontrar.",
  "Más directo, imposible.",
  "Sin floro.",
  "Rápido y al punto.",
  "Esto sí te sirve.",
  "Justo lo que necesitabas.",
  "Te puede salvar hoy.",
] as const;

export const COLORS = {
  primary: "#6C63FF",
  accent: "#C8F135",
  darkBackground: "#1A1A2E",
  lightBackground: "#F5F5FF",
  textOnDark: "#FFFFFF",
  textOnLight: "#1A1A2E",
} as const;

export type MacroCategorySlug =
  | "programacion"
  | "diseno"
  | "marketing"
  | "idiomas"
  | "video_foto"
  | "eventos"
  | "redaccion"
  | "musica"
  | "entretenimiento"
  | "otros";

export type HomeMacroCategory = {
  slug: MacroCategorySlug;
  label: string;
  icon: LucideIcon;
};

export const HOME_MACRO_CATEGORIES: HomeMacroCategory[] = [
  { slug: "programacion", label: "Tecnología", icon: Monitor },
  { slug: "diseno", label: "Diseño", icon: Palette },
  { slug: "marketing", label: "Marketing", icon: TrendingUp },
  { slug: "idiomas", label: "Idiomas", icon: Languages },
  { slug: "video_foto", label: "Video & Foto", icon: Video },
  { slug: "eventos", label: "Eventos", icon: Calendar },
  { slug: "redaccion", label: "Redacción", icon: FileText },
  { slug: "musica", label: "Música", icon: Music },
  { slug: "entretenimiento", label: "Entretenimiento", icon: Sparkles },
  { slug: "otros", label: "Otros", icon: Grid },
];
