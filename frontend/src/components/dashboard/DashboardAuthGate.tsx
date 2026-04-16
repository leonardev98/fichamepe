"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

/**
 * El layout del dashboard no puede fiarse de cookies en el dominio de Next: el refresh
 * httpOnly lo setea el API en su host. Tras `SessionBootstrap`, comprobamos rol en cliente.
 */
export function DashboardAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authBootstrapComplete = useAuthStore((s) => s.authBootstrapComplete);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!authBootstrapComplete) return;
    if (!isAuthenticated) {
      router.replace("/auth/login?from=/dashboard");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/");
    }
  }, [authBootstrapComplete, isAuthenticated, user?.role, router]);

  if (!authBootstrapComplete) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-7xl items-center justify-center px-4 text-sm text-muted">
        Cargando…
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-7xl items-center justify-center px-4 text-sm text-muted">
        Redirigiendo…
      </div>
    );
  }

  return <>{children}</>;
}
