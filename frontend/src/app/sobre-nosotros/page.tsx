import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/layout/StaticInfoPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sobre FichaMePe",
  description:
    "Conoce la historia de FichaMePe, plataforma nacida en Lima para conectar talento freelance local con clientes reales.",
  path: "/sobre-nosotros",
  keywords: ["sobre fichamepe", "plataforma freelance lima"],
});

export default function SobreNosotrosPage() {
  return (
    <StaticInfoPage
      title="Sobre nosotros"
      description="Somos una plataforma nacida en Lima para conectar talento freelance local con clientes reales."
    />
  );
}
