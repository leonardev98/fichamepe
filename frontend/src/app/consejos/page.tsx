import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/layout/StaticInfoPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Consejos para freelancers y clientes",
  description:
    "Tips accionables para mejorar tus publicaciones, contratar mejor y cerrar más chambas freelance.",
  path: "/consejos",
  keywords: ["tips freelance", "mejorar publicaciones", "cerrar clientes"],
});

export default function ConsejosPage() {
  return (
    <StaticInfoPage
      title="Consejos"
      description="Tips cortos para freelancers y clientes que quieren cerrar mejores chambas."
    />
  );
}
