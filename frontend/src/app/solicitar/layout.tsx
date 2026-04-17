import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Solicitudes de clientes",
  description:
    "Publica lo que necesitas o postula a solicitudes abiertas aprobadas por moderación en FichaMePe.",
  path: "/solicitar",
  keywords: [
    "solicitudes de trabajo freelance",
    "postular freelance peru",
    "clientes buscando freelancers",
  ],
});

export default function SolicitarLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
