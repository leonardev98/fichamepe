import Link from "next/link";
import { Globe, MessageCircle, Send, Sparkles } from "lucide-react";
import { FooterRegisterFreelancerButton } from "@/components/layout/FooterRegisterFreelancerButton";
import { SITE_TAGLINES } from "@/lib/constants";

const linkClass =
  "text-sm text-[rgba(255,255,255,0.55)] transition-colors hover:text-[rgba(255,255,255,0.9)]";

export function Footer() {
  return (
    <footer className="mt-auto bg-dark text-white">
      <div className="border-b border-white/10 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 text-sm font-semibold">
          <span>+2,500 freelancers</span>
          <span>+10,000 servicios completados</span>
          <span>Lima, Peru</span>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="mb-10 text-lg font-bold tracking-tight text-white">fichame.pe</p>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-4 text-sm font-semibold text-white">
              Para clientes
            </p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/explorar" className={linkClass}>
                  Explorar servicios
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className={linkClass}>
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className={linkClass}>
                  Centro de ayuda
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold text-white">
              Para freelancers
            </p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/para-freelancers" className={linkClass}>
                  Vender en fichame
                </Link>
              </li>
              <li>
                <FooterRegisterFreelancerButton className={linkClass} />
              </li>
              <li>
                <Link href="/planes-pro" className={linkClass}>
                  Planes Pro
                </Link>
              </li>
              <li>
                <Link href="/consejos" className={linkClass}>
                  Consejos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold text-white">fichame.pe</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/sobre-nosotros" className={linkClass}>
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className={linkClass}>
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/blog" className={linkClass}>
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold text-white">Comunidad y legal</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/terminos" className={linkClass}>
                  Términos
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className={linkClass}>
                  Privacidad
                </Link>
              </li>
              <li>
                <div className="mt-3 flex items-center gap-2">
                  {[
                    { id: "web", Icon: Globe },
                    { id: "chat", Icon: MessageCircle },
                    { id: "telegram", Icon: Send },
                    { id: "spark", Icon: Sparkles },
                  ].map(({ id, Icon }) => (
                    <span
                      key={id}
                      className="inline-flex size-8 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white/50 hover:text-white"
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {[
            "¿Cómo pago de forma segura en fichame.pe?",
            "¿Qué pasa si el servicio no cumple lo acordado?",
            "¿Cómo contacto soporte en Lima?",
            "¿Puedo contratar servicios presenciales?",
          ].map((question) => (
            <details key={question} className="rounded-xl border border-white/15 p-3">
              <summary className="cursor-pointer text-sm font-medium text-white/90">
                {question}
              </summary>
              <p className="mt-2 text-xs text-white/60">
                Te acompañamos durante toda la compra para que contrates con confianza y
                recibas resultado al toque.
              </p>
            </details>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-6xl border-t border-[rgba(255,255,255,0.08)] px-4 py-6">
        <p className="text-center text-[13px] text-[rgba(255,255,255,0.4)]">
          © 2026 fichame.pe — Hecho en Lima, Peru · {SITE_TAGLINES[7]}
        </p>
      </div>
    </footer>
  );
}
