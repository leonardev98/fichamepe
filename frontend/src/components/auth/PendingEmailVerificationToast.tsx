"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Mail, X } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const AUTO_DISMISS_MS = 14_000;

/**
 * Aviso elegante tras registro con correo/contraseña (cuenta aún sin verificar).
 * No se usa con Google OAuth (esas cuentas ya vienen verificadas).
 */
export function PendingEmailVerificationToast() {
  const open = useAuthStore((s) => s.pendingEmailVerificationToast);
  const clear = useAuthStore((s) => s.clearPendingEmailVerificationToast);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => clear(), AUTO_DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [open, clear]);

  if (!open) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:pb-6"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto w-full max-w-md fp-toast-in">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-lg ring-1 ring-black/[0.04]">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/80 via-primary-light to-primary/60" />
          <button
            type="button"
            onClick={() => clear()}
            className="absolute right-2.5 top-2.5 inline-flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-elevated hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="size-4" strokeWidth={2} aria-hidden />
          </button>
          <div className="flex gap-3 p-4 pr-12">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="size-5" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
                Revisa tu bandeja de entrada
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Te enviamos un enlace para verificar tu cuenta. Cuando lo abras podrás publicar y
                conversar. Revisa también spam.
              </p>
              <Link
                href="/cuenta/perfil#verificacion-correo"
                onClick={() => clear()}
                className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                Reenviar o ver estado
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
