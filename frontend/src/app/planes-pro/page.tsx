import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/layout/StaticInfoPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Planes Pro para freelancers",
  description:
    "Descubre los planes pro de FichaMePe para escalar tu visibilidad y conseguir más clientes.",
  path: "/planes-pro",
  keywords: ["planes pro freelance", "visibilidad freelancer"],
});

export default function PlanesProPage() {
  return (
    <StaticInfoPage
      title="Planes Pro"
      description="Conoce nuestros planes para freelancers que quieren escalar su visibilidad y ventas."
    />
  );
}
