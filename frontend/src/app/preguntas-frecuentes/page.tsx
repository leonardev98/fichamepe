import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/layout/StaticInfoPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Preguntas frecuentes",
  description:
    "Resolvemos dudas sobre pagos, entregas, soporte, moderación y contrataciones en FichaMePe.",
  path: "/preguntas-frecuentes",
  keywords: ["faq fichamepe", "soporte fichamepe", "pagos freelance"],
});

export default function PreguntasFrecuentesPage() {
  return (
    <StaticInfoPage
      title="Preguntas frecuentes"
      description="Resolvemos dudas sobre pagos, entregas, soporte y contrataciones en fichame.pe."
    />
  );
}
