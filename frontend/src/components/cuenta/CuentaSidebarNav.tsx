"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const CUENTA_LINKS = [
  { href: "/cuenta/perfil", label: "Editar perfil", match: "/cuenta/perfil" },
  { href: "/cuenta/plan", label: "Planes y cupos", match: "/cuenta/plan" },
  { href: "/skills/new", label: "Nueva habilidad", match: "/skills/new" },
  { href: "/cuenta/configuracion", label: "Configuración", match: "/cuenta/configuracion" },
  { href: "/cuenta/referidos", label: "Mis referidos", match: "/cuenta/referidos" },
  { href: "/cuenta/publicaciones", label: "Mis publicaciones", match: "/cuenta/publicaciones" },
  { href: "/cuenta/solicitudes", label: "Mis solicitudes", match: "/cuenta/solicitudes" },
  {
    href: "/cuenta/publicaciones?filtro=REQUIERE_CAMBIOS",
    label: "Correcciones pendientes",
    match: "/cuenta/publicaciones",
  },
] as const;

export function CuentaSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="flex flex-col gap-1" aria-label="Mi cuenta">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Cuenta</p>
      {CUENTA_LINKS.map((item) => {
        const active = item.match ? pathname === item.match || pathname.startsWith(`${item.match}/`) : false;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-primary/[0.06]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <div className="my-3 border-t border-border" />
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-accent-red transition hover:bg-accent-red/5"
      >
        <LogOut className="size-4 shrink-0" aria-hidden />
        Cerrar sesión
      </button>
    </nav>
  );
}
