"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { bootstrapSessionFromCookies } from "@/lib/api";
import { resolvePostLoginHref } from "@/lib/post-login-redirect";
import { useAuthStore } from "@/store/auth.store";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const from = searchParams.get("from");
    const safeFrom =
      typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
        ? from
        : null;
    void (async () => {
      const ok = await bootstrapSessionFromCookies();
      if (!ok) {
        setErrorMessage("No pudimos completar el acceso con Google.");
        router.replace("/auth/login?error=google");
        return;
      }
      const user = useAuthStore.getState().user;
      if (!user) {
        setErrorMessage("Sesión incompleta.");
        router.replace("/auth/login?error=google");
        return;
      }
      void import("@/stores/favoritesStore").then(({ useFavoritesStore }) => {
        void useFavoritesStore.getState().syncFromApi();
      });
      router.replace(resolvePostLoginHref(user.role, safeFrom));
    })();
  }, [router, searchParams]);

  if (errorMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="max-w-sm text-sm text-muted">{errorMessage}</p>
        <Link
          href="/auth/login"
          className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="size-7 animate-spin text-muted" aria-hidden />
      <p className="text-sm font-medium tracking-tight text-foreground">Redireccionando…</p>
    </div>
  );
}

function GoogleCallbackFallback() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6"
      role="status"
      aria-busy="true"
    >
      <Loader2 className="size-7 animate-spin text-muted" aria-hidden />
      <p className="text-sm font-medium tracking-tight text-foreground">Redireccionando…</p>
    </div>
  );
}

export default function GoogleOAuthCallbackPage() {
  return (
    <Suspense fallback={<GoogleCallbackFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
