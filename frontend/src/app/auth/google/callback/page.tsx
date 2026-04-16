"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { bootstrapSessionFromCookies } from "@/lib/api";
import { resolvePostLoginHref } from "@/lib/post-login-redirect";
import { useAuthStore } from "@/store/auth.store";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completando inicio de sesión…");

  useEffect(() => {
    const from = searchParams.get("from");
    const safeFrom =
      typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
        ? from
        : null;
    void (async () => {
      const ok = await bootstrapSessionFromCookies();
      if (!ok) {
        setMessage("No pudimos completar el acceso con Google. Prueba de nuevo.");
        router.replace("/auth/login?error=google");
        return;
      }
      const user = useAuthStore.getState().user;
      if (!user) {
        setMessage("Sesión incompleta.");
        router.replace("/auth/login?error=google");
        return;
      }
      void import("@/stores/favoritesStore").then(({ useFavoritesStore }) => {
        void useFavoritesStore.getState().syncFromApi();
      });
      router.replace(resolvePostLoginHref(user.role, safeFrom));
    })();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-muted">{message}</p>
      <Link href="/" className="text-sm font-medium text-accent underline-offset-2 hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}

function GoogleCallbackFallback() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
      <p className="text-sm text-muted">Cargando…</p>
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
