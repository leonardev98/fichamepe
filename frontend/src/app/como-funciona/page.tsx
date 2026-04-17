import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_TAGLINES } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cómo funciona FichaMePe",
  description:
    "Aprende cómo contratar o vender servicios freelance en FichaMePe en pocos pasos y sin intermediarios.",
  path: "/como-funciona",
  keywords: ["como funciona fichamepe", "contratar freelancers", "vender servicios"],
});

const DISCOVERY_EXAMPLES = [
  "Alguien que te arme tu CV y te consiga chamba",
  "Un editor que te vuelva viral",
  "Un animador que levante tu fiesta",
  "Un fotógrafo que te haga ver pro",
  "Alguien que te ayude con una cita",
  "Un crack que te arme tu negocio",
  "Clases rápidas para aprender algo hoy",
  "Alguien que te resuelva un problema urgente",
  "Un creativo que te diseñe todo",
  "Un especialista que te saque de apuros",
] as const;

export default function ComoFuncionaPage() {
  return (
    <div className="flex min-h-full flex-col bg-white text-[#1A1A2E]">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Cómo funciona (spoiler: es ridículamente fácil)
          </h1>
          <ol className="mx-auto mt-8 max-w-md list-decimal space-y-2 pl-5 text-left text-[15px] leading-relaxed marker:font-semibold">
            <li>Buscas lo que necesitas (aunque sea raro).</li>
            <li>Encuentras a alguien que lo hace.</li>
            <li>Le escribes directo y lo resuelves.</li>
          </ol>
          <p className="mt-8 text-sm font-semibold text-[#6C63FF]">
            {SITE_TAGLINES[4]} {SITE_TAGLINES[5]}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
            Sin agencias. Sin vueltas. Sin perder el tiempo.
          </p>
        </div>

        <section className="border-y border-[#E5E7EB] bg-[#F5F5FF] py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-[15px] font-semibold leading-relaxed text-[#1A1A2E]">
              No somos una bolsa de trabajo.
              <br />
              No somos una agencia.
            </p>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#6B7280]">
              Somos el lugar donde encuentras a la persona exacta para lo que
              necesitas.
            </p>
            <p className="mt-4 text-sm font-semibold text-[#6C63FF]">
              Rápido. Directo. Sin intermediarios.
            </p>
            <p className="mt-3 text-sm text-[#6B7280]">{SITE_TAGLINES[6]}</p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-center text-xl font-bold text-[#1A1A2E] sm:text-2xl">
              Cosas que podrías contratar hoy (y no sabías)
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[15px] text-[#6B7280]">
              {SITE_TAGLINES[0]} {SITE_TAGLINES[2]}
            </p>
            <ul className="mx-auto mt-8 max-w-lg list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-[#1A1A2E] marker:text-[#6C63FF]">
              {DISCOVERY_EXAMPLES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-6 text-center text-sm font-medium text-[#6C63FF]">
              Y sí… hay más raros todavía.
            </p>
            <p className="mt-2 text-center text-sm text-[#6B7280]">
              {SITE_TAGLINES[8]}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
