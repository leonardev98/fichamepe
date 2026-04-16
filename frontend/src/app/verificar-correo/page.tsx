"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  fetchAuthMe,
  parseApiErrorMessage,
  postVerifyEmail,
} from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/auth.store";

function VerificarCorreoContent() {
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const raw = searchParams.get("token")?.trim();
    if (!raw) {
      queueMicrotask(() => {
        setStatus("err");
        setMessage("Este enlace no es válido o está incompleto.");
      });
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await postVerifyEmail(raw);
        if (cancelled) return;
        setStatus("ok");
        setMessage(res.message);
        if (accessToken) {
          try {
            const me = await fetchAuthMe();
            if (!cancelled) setUser(me);
          } catch {
            /* sesión opcional */
          }
        }
      } catch (e) {
        if (cancelled) return;
        setStatus("err");
        setMessage(parseApiErrorMessage(e, "No se pudo verificar el correo."));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, setUser, accessToken]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
        Verificar correo
      </h1>
      {status === "loading" ? (
        <p className="mt-4 text-muted">Comprobando enlace…</p>
      ) : null}
      {status === "ok" ? (
        <div
          className="mt-8 flex w-full flex-col items-center gap-3 rounded-2xl border border-success/25 bg-success/5 px-6 py-8"
          role="status"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-8" strokeWidth={2} aria-hidden />
          </span>
          <p className="font-heading text-lg font-semibold text-foreground">Correo verificado</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted">{message}</p>
        </div>
      ) : null}
      {status === "err" ? (
        <p className="mt-6 text-accent-red" role="alert">
          {message}
        </p>
      ) : null}
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:opacity-95"
      >
        Ir al inicio
      </Link>
    </div>
  );
}

export default function VerificarCorreoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted">Cargando…</div>
      }
    >
      <VerificarCorreoContent />
    </Suspense>
  );
}
