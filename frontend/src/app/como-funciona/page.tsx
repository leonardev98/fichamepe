import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ComoFuncionaContent } from "@/components/como-funciona/ComoFuncionaContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cómo funciona FichaMePe",
  description:
    "Aprende cómo contratar o vender servicios freelance en FichaMePe en pocos pasos y sin intermediarios.",
  path: "/como-funciona",
  keywords: ["como funciona fichamepe", "contratar freelancers", "vender servicios"],
});

export default function ComoFuncionaPage() {
  return (
    <div className="flex min-h-full flex-col bg-white text-foreground">
      <Navbar />
      <ComoFuncionaContent />
      <Footer />
    </div>
  );
}
