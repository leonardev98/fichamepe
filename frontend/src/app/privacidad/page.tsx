import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/layout/StaticInfoPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Política de privacidad",
  description:
    "Conoce cómo protegemos y usamos tus datos en FichaMePe conforme a nuestra política de privacidad.",
  path: "/privacidad",
  keywords: ["privacidad fichamepe", "datos personales"],
});

export default function PrivacidadPage() {
  return (
    <StaticInfoPage
      title="Política de privacidad"
      description="Te explicamos cómo protegemos y usamos tus datos dentro de fichame.pe."
    />
  );
}
