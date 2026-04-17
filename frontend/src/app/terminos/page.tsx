import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/layout/StaticInfoPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Términos y condiciones",
  description:
    "Revisa las reglas de uso de FichaMePe para clientes y freelancers, incluyendo políticas de moderación.",
  path: "/terminos",
  keywords: ["terminos fichamepe", "condiciones de uso"],
});

export default function TerminosPage() {
  return (
    <StaticInfoPage
      title="Términos y condiciones"
      description="Revisa las reglas de uso de fichame.pe para clientes y freelancers."
    />
  );
}
