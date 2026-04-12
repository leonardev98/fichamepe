"use client";

import Link from "next/link";
import { useOverlayState } from "@heroui/react";
import { Drawer } from "@heroui/react/drawer";
import { buttonVariants } from "@heroui/styles";

function BrandLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`text-xl font-semibold tracking-tight ${className ?? ""}`}
    >
      <span className="text-primary">fícháme</span>
      <span className="text-accent">.pe</span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const linkClass =
    "text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md px-1 py-0.5";

  return (
    <>
      <Link href="/explorar" className={linkClass} onClick={onNavigate}>
        Explorar
      </Link>
      <Link href="/#como-funciona" className={linkClass} onClick={onNavigate}>
        Cómo funciona
      </Link>
      <Link href="/#para-freelancers" className={linkClass} onClick={onNavigate}>
        Para freelancers
      </Link>
    </>
  );
}

function AuthButtons({ fullWidth }: { fullWidth?: boolean }) {
  const w = fullWidth ? "w-full" : "";
  const outline = buttonVariants({
    variant: "outline",
    fullWidth: !!fullWidth,
    className: `border-border text-foreground hover:bg-surface-elevated ${w}`,
  });
  const primary = buttonVariants({
    variant: "primary",
    fullWidth: !!fullWidth,
    className: `bg-primary text-white hover:opacity-95 ${w}`,
  });
  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:items-center ${fullWidth ? "w-full" : ""}`}
    >
      <Link href="/auth/login" className={`${outline} text-center no-underline`}>
        Entrar
      </Link>
      <Link
        href="/auth/register"
        className={`${primary} text-center no-underline`}
      >
        Publicar perfil
      </Link>
    </div>
  );
}

export function Navbar() {
  const mobileNav = useOverlayState();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-[#1A1A2E]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <BrandLink />

        <nav className="hidden items-center gap-8 md:flex">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <AuthButtons />
        </div>

        <div className="flex md:hidden">
          <Drawer state={mobileNav}>
            <Drawer.Trigger
              aria-label="Abrir menú"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground outline-none transition-colors hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </Drawer.Trigger>
            <Drawer.Backdrop isDismissable>
              <Drawer.Content placement="right" className="max-w-xs">
                <Drawer.Dialog className="border-l border-border bg-surface">
                  <Drawer.Header className="flex items-center justify-between border-b border-border px-4 py-3">
                    <BrandLink className="text-lg" />
                    <Drawer.CloseTrigger aria-label="Cerrar menú" />
                  </Drawer.Header>
                  <Drawer.Body className="flex flex-col gap-6 p-4">
                    <nav className="flex flex-col gap-4">
                      <NavLinks onNavigate={() => mobileNav.close()} />
                    </nav>
                    <AuthButtons fullWidth />
                  </Drawer.Body>
                </Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
