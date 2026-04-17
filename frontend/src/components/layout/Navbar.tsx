"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  ClipboardList,
  CircleAlert,
  FileStack,
  Heart,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Settings,
  UserPen,
  Users,
  X,
} from "lucide-react";
import { useOverlayState } from "@heroui/react";
import { Button } from "@heroui/react/button";
import { Drawer } from "@heroui/react/drawer";
import { Dropdown } from "@heroui/react/dropdown";
import { ChatDock } from "@/components/conversaciones/ChatDock";
import { ConversationsPopover } from "@/components/conversaciones/ConversationsPopover";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useAuthModals } from "@/components/auth/auth-modals-context";
import { useAuthStore } from "@/store/auth.store";
import { useConversationsStore } from "@/stores/conversationsStore";
import { useNotificationsStore } from "@/stores/notificationsStore";
import { NavbarCompactSearch } from "@/components/layout/NavbarCompactSearch";
import { CountrySelector } from "@/components/layout/CountrySelector";
import { SITE_LOGO_URL } from "@/lib/constants";
import type { AuthUser } from "@/types/auth";

const ACCOUNT_MENU_LINKS = [
  { href: "/cuenta/plan", label: "Planes y cupos", Icon: LayoutGrid },
  { href: "/cuenta/configuracion", label: "Configuración", Icon: Settings },
  { href: "/cuenta/referidos", label: "Mis referidos", Icon: Users },
  { href: "/cuenta/publicaciones", label: "Mis publicaciones", Icon: FileStack },
  {
    href: "/cuenta/publicaciones?filtro=REQUIERE_CAMBIOS",
    label: "Correcciones pendientes",
    Icon: ClipboardList,
  },
] as const;

function firstNameFromUser(user: AuthUser): string {
  const full = user.fullName?.trim();
  if (full) {
    const first = full.split(/\s+/)[0];
    return first ?? full;
  }
  const local = user.email.split("@")[0];
  return local || "Usuario";
}

function initialsFromUser(user: AuthUser): string {
  const full = user.fullName?.trim();
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
    }
    return full.slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

function accountPillClassName(fullWidth?: boolean) {
  return `group flex items-center gap-2.5 rounded-full border border-border bg-white py-1.5 text-left transition hover:border-primary/45 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
    fullWidth ? "w-full px-2" : "max-w-[min(100%,220px)] shrink-0 pl-1.5 pr-3"
  }`;
}

function UserAccountPillContent({ user }: { user: AuthUser }) {
  const name = firstNameFromUser(user);
  const initials = initialsFromUser(user);
  const avatar = user.avatarUrl?.trim() || null;
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2.5">
      <span className="relative flex size-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary-light shadow-sm">
        {avatar ? (
          <Image src={avatar} alt="" fill className="object-cover" sizes="36px" />
        ) : (
          <span
            className="flex size-full items-center justify-center text-xs font-bold text-white"
            aria-hidden
          >
            {initials}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold leading-tight text-foreground group-hover:text-primary">
          Hola, {name}
        </span>
        <span className="block truncate text-xs text-muted">Mi cuenta</span>
        {!user.isPublicationExempt && user.publicationActiveMax != null ? (
          <span className="block truncate text-[11px] font-medium tabular-nums text-primary/90">
            {user.publicationActiveCount}/{user.publicationActiveMax} activas
          </span>
        ) : null}
      </span>
    </span>
  );
}

function UserAccountDropdown({ user }: { user: AuthUser }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label="Menú de cuenta"
        className={`${accountPillClassName()} !h-auto !min-h-0 !rounded-full !border-border !bg-white !py-1.5 !pl-1.5 !pr-3 !font-normal !shadow-none hover:!bg-primary/[0.06]`}
      >
        <UserAccountPillContent user={user} />
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end" className="min-w-[220px]">
        <Dropdown.Menu aria-label="Cuenta">
          <Dropdown.Item key="/cuenta/perfil" href="/cuenta/perfil" className="cursor-pointer">
            <span className="flex items-center gap-2.5">
              <UserPen className="size-4 shrink-0 text-muted" aria-hidden />
              <span className="flex min-w-0 flex-col gap-0.5 text-left">
                <span>Editar perfil</span>
                {user.emailVerified === false ? (
                  <span className="text-xs font-medium text-primary">Correo pendiente de verificación</span>
                ) : (
                  <span className="text-xs text-muted">Correo verificado</span>
                )}
              </span>
            </span>
          </Dropdown.Item>
          {user.emailVerified === false ? (
            <Dropdown.Item
              key="/cuenta/perfil#verificacion-correo"
              href="/cuenta/perfil#verificacion-correo"
              className="cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <CircleAlert className="size-4 shrink-0 text-primary" aria-hidden />
                <span className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span>Verificar correo</span>
                  <span className="text-xs text-muted">Reenviar enlace o ver estado</span>
                </span>
              </span>
            </Dropdown.Item>
          ) : (
            <Dropdown.Item
              key="/cuenta/perfil#verificacion-correo"
              href="/cuenta/perfil#verificacion-correo"
              className="cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <BadgeCheck className="size-4 shrink-0 text-success" aria-hidden />
                <span className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span>Correo verificado</span>
                  <span className="text-xs text-muted">Ver detalles en tu perfil</span>
                </span>
              </span>
            </Dropdown.Item>
          )}
          {ACCOUNT_MENU_LINKS.map((item) => {
            const Icon = item.Icon;
            return (
              <Dropdown.Item key={item.href} href={item.href} className="cursor-pointer">
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0 text-muted" aria-hidden />
                  <span>{item.label}</span>
                </span>
              </Dropdown.Item>
            );
          })}
          <Dropdown.Item variant="danger" className="cursor-pointer" onAction={handleLogout}>
            <span className="flex items-center gap-2.5">
              <LogOut className="size-4 shrink-0 opacity-90" aria-hidden />
              <span>Cerrar sesión</span>
            </span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

function UserAccountMobileBlock({
  user,
  onNavigate,
}: {
  user: AuthUser;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const hubHref = "/cuenta";
  const linkClass =
    "rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-primary/5";

  const handleLogout = () => {
    onNavigate?.();
    logout();
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-1 border-t border-border pt-4">
      <Link
        href={hubHref}
        onClick={onNavigate}
        className={`${accountPillClassName(true)} no-underline`}
      >
        <UserAccountPillContent user={user} />
      </Link>
      <div className="mt-1 flex flex-col gap-0.5">
        <Link href="/cuenta/perfil" onClick={onNavigate} className={`${linkClass} flex flex-col gap-0.5`}>
          <span className="inline-flex items-center gap-2.5">
            <UserPen className="size-4 shrink-0 text-muted" aria-hidden />
            Editar perfil
          </span>
          {user.emailVerified === false ? (
            <span className="pl-7 text-xs font-medium text-primary">Correo pendiente de verificación</span>
          ) : (
            <span className="pl-7 text-xs text-muted">Correo verificado</span>
          )}
        </Link>
        {user.emailVerified === false ? (
          <Link
            href="/cuenta/perfil#verificacion-correo"
            onClick={onNavigate}
            className={`${linkClass} inline-flex items-center gap-2.5`}
          >
            <CircleAlert className="size-4 shrink-0 text-primary" aria-hidden />
            Verificar correo
          </Link>
        ) : (
          <Link
            href="/cuenta/perfil#verificacion-correo"
            onClick={onNavigate}
            className={`${linkClass} inline-flex items-center gap-2.5`}
          >
            <BadgeCheck className="size-4 shrink-0 text-success" aria-hidden />
            Estado del correo
          </Link>
        )}
        {ACCOUNT_MENU_LINKS.map((item) => {
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`${linkClass} inline-flex items-center gap-2.5`}
            >
              <Icon className="size-4 shrink-0 text-muted" aria-hidden />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className={`${linkClass} inline-flex items-center gap-2.5 text-left text-accent-red`}
        >
          <LogOut className="size-4 shrink-0 opacity-90" aria-hidden />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function BrandLink() {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center no-underline outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
    >
      <Image
        src={SITE_LOGO_URL}
        alt="fichame.pe"
        width={360}
        height={78}
        className="h-12 w-auto shrink-0 object-contain object-left transition-transform duration-200 group-hover:scale-[1.01] sm:h-12 md:h-14"
        priority
        sizes="(max-width: 640px) 280px, (max-width: 1024px) 360px, 400px"
      />
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const linkClass =
    "whitespace-nowrap text-sm text-muted transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md px-1 py-0.5";

  return (
    <>
      <Link href="/explorar" className={linkClass} onClick={onNavigate}>
        Explorar
      </Link>
      <Link href="/como-funciona" className={linkClass} onClick={onNavigate}>
        Cómo funciona
      </Link>
      <Link href="/solicitar" className={linkClass} onClick={onNavigate}>
        Solicitar
      </Link>
    </>
  );
}

function AuthButtons({
  fullWidth,
  onPressLogin,
  onPressRegister,
}: {
  fullWidth?: boolean;
  onPressLogin: () => void;
  onPressRegister: () => void;
}) {
  const w = fullWidth ? "w-full" : "";

  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:items-center ${fullWidth ? "w-full" : ""}`}
    >
      <Button
        variant="outline"
        className={`rounded-full border-primary bg-transparent px-5 font-semibold text-primary hover:bg-primary/5 ${w}`}
        onPress={onPressLogin}
      >
        Inicio de sesión
      </Button>
      <Button
        variant="primary"
        className={`rounded-full bg-gradient-to-r from-primary to-primary-light px-5 font-semibold text-white hover:opacity-95 ${w}`}
        onPress={onPressRegister}
      >
        Empieza gratis
      </Button>
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const mobileNav = useOverlayState();
  const { openLogin, openRegister } = useAuthModals();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const unreadTotal = useConversationsStore((state) => state.unreadTotal());
  const unreadNotifications = useNotificationsStore((s) => s.unreadCount);
  const [isConversationsOpen, setIsConversationsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const conversationsMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsMenuRef = useRef<HTMLDivElement | null>(null);
  const accountUser = isAuthenticated && user ? user : null;

  useEffect(() => {
    if (!isConversationsOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!conversationsMenuRef.current) return;
      if (!conversationsMenuRef.current.contains(event.target as Node)) {
        setIsConversationsOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsConversationsOpen(false);
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEscape);
    };
  }, [isConversationsOpen]);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!notificationsMenuRef.current) return;
      if (!notificationsMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEscape);
    };
  }, [isNotificationsOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <BrandLink />

          <div className="hidden min-w-[320px] max-w-[540px] flex-1 xl:block">
            <NavbarCompactSearch className="w-full" />
          </div>

          <nav className="hidden items-center gap-4 lg:flex">
            <NavLinks />
          </nav>

          <div className="hidden lg:flex">
            <CountrySelector compact />
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {accountUser ? (
              <>
                <Link
                  href="/skills/new"
                  className="hidden h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-4 text-sm font-semibold text-white no-underline transition hover:opacity-95 xl:inline-flex"
                >
                  <Plus className="size-4" aria-hidden />
                  Publicar habilidad
                </Link>

                <div className="relative" ref={conversationsMenuRef}>
                  <button
                    type="button"
                    className="relative inline-flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition hover:border-primary/50 hover:bg-primary/15"
                    aria-label="Conversaciones"
                    onClick={() => setIsConversationsOpen((prev) => !prev)}
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    {unreadTotal > 0 ? (
                      <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 py-0.5 text-[10px] font-bold text-white">
                        {unreadTotal}
                      </span>
                    ) : null}
                  </button>
                  {isConversationsOpen ? (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-[65]">
                      <ConversationsPopover onOpenChange={setIsConversationsOpen} />
                    </div>
                  ) : null}
                </div>

                <div className="relative" ref={notificationsMenuRef}>
                  <button
                    type="button"
                    className="relative inline-flex size-10 items-center justify-center rounded-full border border-border text-muted transition hover:border-primary/40 hover:text-primary"
                    aria-label="Notificaciones"
                    aria-expanded={isNotificationsOpen}
                    onClick={() => setIsNotificationsOpen((prev) => !prev)}
                  >
                    <Bell className="size-4" aria-hidden />
                    {unreadNotifications > 0 ? (
                      <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-accent-red px-1 py-0.5 text-[10px] font-bold text-white">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                      </span>
                    ) : null}
                  </button>
                  {isNotificationsOpen ? (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-[65]">
                      <NotificationsPopover onOpenChange={setIsNotificationsOpen} />
                    </div>
                  ) : null}
                </div>
                <Link
                  href="/favoritos"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted transition hover:border-primary/40 hover:text-primary"
                  aria-label="Favoritos"
                >
                  <Heart className="size-4" aria-hidden />
                </Link>
                <UserAccountDropdown user={accountUser} />
              </>
            ) : (
              <AuthButtons onPressLogin={openLogin} onPressRegister={openRegister} />
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {accountUser ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push("/skills/new")}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition hover:opacity-95"
                  aria-label="Publicar habilidad"
                >
                  <Plus className="size-5" aria-hidden />
                </button>
                <Link
                  href="/conversaciones"
                  className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition hover:border-primary/50"
                  aria-label="Conversaciones"
                >
                  <MessageCircle className="size-5" aria-hidden />
                  {unreadTotal > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 py-0.5 text-[10px] font-bold text-white">
                      {unreadTotal}
                    </span>
                  ) : null}
                </Link>
              </>
            ) : null}
            <Drawer state={mobileNav}>
              <Drawer.Trigger
                aria-label="Abrir menú"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground outline-none transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Menu className="size-5 shrink-0" strokeWidth={2} aria-hidden />
              </Drawer.Trigger>
              <Drawer.Backdrop isDismissable>
                <Drawer.Content placement="right" className="max-w-xs">
                  <Drawer.Dialog className="border-l border-border bg-white">
                    <Drawer.Header className="flex items-center justify-between border-b border-border px-4 py-3">
                      <BrandLink />
                      <Drawer.Heading className="sr-only">Menú principal</Drawer.Heading>
                      <Drawer.CloseTrigger
                        aria-label="Cerrar menú"
                        className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/5 hover:text-foreground"
                      >
                        <X className="size-5" strokeWidth={2} aria-hidden />
                      </Drawer.CloseTrigger>
                    </Drawer.Header>
                    <Drawer.Body className="flex flex-col gap-6 p-4">
                      <NavbarCompactSearch className="w-full" />
                      <CountrySelector className="w-full justify-between" />
                      <nav className="flex flex-col gap-4">
                        <NavLinks onNavigate={() => mobileNav.close()} />
                      </nav>
                      {accountUser ? (
                        <div className="space-y-2">
                          <Button
                            variant="primary"
                            className="w-full whitespace-nowrap rounded-full bg-primary font-semibold text-white hover:opacity-95"
                            onPress={() => {
                              mobileNav.close();
                              router.push("/skills/new");
                            }}
                          >
                            <Plus className="size-4" aria-hidden />
                            Publicar habilidad
                          </Button>
                          <Link
                            href="/conversaciones"
                            onClick={() => mobileNav.close()}
                            className="inline-flex w-full items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/35 hover:bg-primary/5"
                          >
                            Conversaciones
                            {unreadTotal > 0 ? (
                              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {unreadTotal}
                              </span>
                            ) : null}
                          </Link>
                          <Link
                            href="/notificaciones"
                            onClick={() => mobileNav.close()}
                            className="inline-flex w-full items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/35 hover:bg-primary/5"
                          >
                            Notificaciones
                            {unreadNotifications > 0 ? (
                              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent-red px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {unreadNotifications > 99 ? "99+" : unreadNotifications}
                              </span>
                            ) : null}
                          </Link>
                          <UserAccountMobileBlock
                            user={accountUser}
                            onNavigate={() => mobileNav.close()}
                          />
                        </div>
                      ) : (
                        <AuthButtons
                          fullWidth
                          onPressLogin={() => {
                            mobileNav.close();
                            openLogin();
                          }}
                          onPressRegister={() => {
                            mobileNav.close();
                            openRegister();
                          }}
                        />
                      )}
                    </Drawer.Body>
                  </Drawer.Dialog>
                </Drawer.Content>
              </Drawer.Backdrop>
            </Drawer>
          </div>
        </div>
      </header>
      {accountUser ? <ChatDock /> : null}
    </>
  );
}
