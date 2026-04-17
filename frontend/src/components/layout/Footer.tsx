import Link from "next/link";
import {
  ArrowUpRight,
  Globe,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FooterRegisterFreelancerButton } from "@/components/layout/FooterRegisterFreelancerButton";

const linkClass =
  "text-sm text-white/70 transition-colors hover:text-white";

const clientLinks = [
  { href: "/explorar", label: "Explorar servicios" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/preguntas-frecuentes", label: "Centro de ayuda" },
];

const freelancerLinks = [
  { href: "/para-freelancers", label: "Vender en fichame.pe" },
  { href: "/planes-pro", label: "Planes Pro" },
  { href: "/consejos", label: "Consejos prácticos" },
];

const companyLinks = [
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/blog", label: "Blog" },
];

const legalLinks = [
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
];

const communityLinks = [
  { id: "web", Icon: Globe, label: "Sitio", href: "/" },
  { id: "chat", Icon: MessageCircle, label: "Contacto", href: "/contacto" },
  { id: "telegram", Icon: Send, label: "Comunidad", href: "/consejos" },
  { id: "spark", Icon: Sparkles, label: "Blog", href: "/blog" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-marketing-deep text-marketing-on">
      <div className="mx-auto max-w-6xl px-4 pb-7 pt-12 md:pt-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="max-w-md text-sm leading-6 text-marketing-on-muted">
              Encuentra freelancers verificados en Lima para resolver proyectos reales en minutos.
              Menos fricción, más resultados.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {[
                { label: "Freelancers activos", value: "+2,500" },
                { label: "Servicios completados", value: "+10,000" },
                { label: "Atención en Perú", value: "24/7" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3"
                >
                  <p className="text-base font-semibold text-marketing-on">{item.value}</p>
                  <p className="mt-0.5 text-xs text-marketing-on-muted">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/explorar"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-light px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary"
              >
                Explorar servicios
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
              <FooterRegisterFreelancerButton className="inline-flex rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-marketing-on transition hover:border-white/40 hover:bg-white/[0.08]" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <div>
              <p className="mb-4 text-sm font-semibold text-marketing-on">Para clientes</p>
              <ul className="space-y-2.5">
                {clientLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-sm font-semibold text-marketing-on">Para freelancers</p>
              <ul className="space-y-2.5">
                {freelancerLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-sm font-semibold text-marketing-on">Empresa</p>
              <ul className="space-y-2.5">
                {companyLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-2">
                {communityLinks.map(({ id, Icon, label, href }) => (
                  <Link
                    key={id}
                    href={href}
                    aria-label={label}
                    title={label}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-white/20 text-marketing-on-muted transition hover:border-white/45 hover:text-marketing-on"
                  >
                    <Icon className="size-4" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid items-center gap-3 md:grid-cols-3">
          <div className="order-2 flex flex-wrap items-center justify-center gap-4 md:order-1 md:justify-start">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </div>

          <p className="order-1 text-center text-xs tracking-wide text-marketing-on-subtle md:order-2">
            © {currentYear} fichame.pe — Hecho en Lima, Perú.
          </p>

          <p className="order-3 inline-flex items-center justify-center gap-2 text-xs text-marketing-on-muted md:justify-end">
            <ShieldCheck className="size-4 text-[#76f3ef]" aria-hidden />
            Plataforma protegida para compras y entregas digitales.
          </p>
        </div>
      </div>
    </footer>
  );
}
