import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FreelancerCtaButton } from "@/components/home/FreelancerCtaButton";
import { SITE_TAGLINES } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Para freelancers",
  description:
    "Guía para freelancers que quieren publicar servicios, ganar visibilidad y conseguir clientes en FichaMePe.",
  path: "/para-freelancers",
  keywords: [
    "freelancers peru",
    "publicar servicios freelance",
    "conseguir clientes",
  ],
});

export default function ParaFreelancersPage() {
  return (
    <div className="flex min-h-full flex-col bg-white text-[#1A1A2E]">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#6C63FF] px-4 py-16 md:px-8 md:py-20">
          <div className="pointer-events-none absolute left-[-20px] top-1/2 -translate-y-1/2">
            <span className="absolute left-0 top-0 h-[120px] w-[120px] rounded-full bg-white/10" />
            <span className="absolute left-8 top-5 h-20 w-20 rounded-full bg-white/10" />
            <span className="absolute left-16 top-10 h-[50px] w-[50px] rounded-full bg-white/10" />
          </div>
          <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h1 className="text-[clamp(28px,4vw,36px)] font-bold text-white">
                ¿Tienes un talento? Haz plata con eso.
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-[rgba(255,255,255,0.85)]">
                Si sabes hacer algo —lo que sea— hay alguien dispuesto a pagarlo.
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-[rgba(255,255,255,0.75)]">
                No importa si es serio, creativo o poco común.
              </p>
              <p className="mt-5 text-[15px] font-semibold leading-relaxed text-white">
                Acá no vienes a buscar trabajo.
                <br />
                Vienes a vender lo que sabes.
              </p>
              <p className="mt-4 text-sm text-[rgba(255,255,255,0.65)]">
                {SITE_TAGLINES[3]}
              </p>
            </div>
            <FreelancerCtaButton />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
