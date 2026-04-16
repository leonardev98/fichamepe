"use client";

import { useEffect, useState } from "react";
import { Mail, X } from "lucide-react";
import { useResendVerificationEmail } from "@/hooks/use-resend-verification-email";
import { useAuthStore } from "@/store/auth.store";

function bannerDismissKey(userId: string) {
  return `fichamepe:dismissedEmailVerificationBanner:${userId}`;
}

export function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { pending, feedback, resend, clearFeedback } = useResendVerificationEmail();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        setDismissed(localStorage.getItem(bannerDismissKey(user.id)) === "1");
      } catch {
        setDismissed(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!isAuthenticated || !user || user.emailVerified !== false || dismissed) {
    return null;
  }

  const onDismiss = () => {
    try {
      localStorage.setItem(bannerDismissKey(user.id), "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div
      role="status"
      className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md"
    >
      <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 pr-12 sm:flex-row sm:items-center sm:gap-4 sm:py-2.5 sm:pr-14">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-elevated hover:text-foreground"
          aria-label="Ocultar aviso"
        >
          <X className="size-4" strokeWidth={2} aria-hidden />
        </button>

        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="size-4" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug text-foreground">
              Confirma tu correo para publicar y chatear
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              Revisa spam si no ves el mensaje.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:shrink-0 sm:items-end">
          <button
            type="button"
            disabled={pending}
            className="inline-flex h-8 min-h-8 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-light px-3.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-55 sm:w-auto"
            onClick={() => {
              clearFeedback();
              void resend();
            }}
          >
            {pending ? "Enviando…" : "Reenviar enlace"}
          </button>
          {feedback ? (
            <span className="text-[11px] leading-snug text-muted sm:max-w-[240px] sm:text-right">
              {feedback}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
