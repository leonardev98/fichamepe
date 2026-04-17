"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Gift, Link2, RefreshCw, Share2, Users } from "lucide-react";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { ProgressBar } from "@heroui/react/progress-bar";
import { fetchAuthMe, parseApiErrorMessage } from "@/lib/api/auth.api";
import {
  fetchMyReferredUsers,
  postApplyReferralCode,
  type ReferredUserRow,
} from "@/lib/api/referrals.api";
import { useAuthStore } from "@/store/auth.store";

function shareUrlForCode(code: string): string {
  if (typeof window === "undefined") return "";
  const u = new URL(window.location.origin);
  u.searchParams.set("ref", code);
  return u.toString();
}

function formatReferralDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export function CuentaReferidosClient() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [codeInput, setCodeInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [referred, setReferred] = useState<ReferredUserRow[]>([]);
  const [refLoading, setRefLoading] = useState(false);
  const [refError, setRefError] = useState(false);

  const myCode = user?.referralCode ?? "";
  const link = useMemo(() => shareUrlForCode(myCode), [myCode]);

  const featuredMax = useMemo(() => {
    if (!user) return 0;
    return Math.max(0, user.featuredActiveMax ?? user.referralDirectCount ?? 0);
  }, [user]);

  const featuredQuotaPct = useMemo(() => {
    if (!user || featuredMax <= 0) {
      return 0;
    }
    return Math.min(
      100,
      Math.round(((user.featuredActiveCount ?? 0) / featuredMax) * 100),
    );
  }, [featuredMax, user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      setRefLoading(true);
      setRefError(false);
      try {
        const items = await fetchMyReferredUsers();
        if (!cancelled) setReferred(items);
      } catch {
        if (!cancelled) {
          setReferred([]);
          setRefError(true);
        }
      } finally {
        if (!cancelled) setRefLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intencional: al cambiar de usuario; la lista también se refresca con el botón «Actualizar».
    // eslint-disable-next-line react-hooks/exhaustive-deps -- user?.id identifica la cuenta
  }, [user?.id]);

  const reloadReferrals = useCallback(async () => {
    if (!user) return;
    setRefLoading(true);
    setRefError(false);
    try {
      setReferred(await fetchMyReferredUsers());
    } catch {
      setReferred([]);
      setRefError(true);
    } finally {
      setRefLoading(false);
    }
  }, [user]);

  const copyText = useCallback(async (text: string, kind: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setMessage({ type: "err", text: "No se pudo copiar al portapapeles." });
    }
  }, []);

  const onApplyReferral = async () => {
    if (!user) return;
    const raw = codeInput.trim().toUpperCase();
    if (raw.length < 4) {
      setMessage({ type: "err", text: "Ingresa un código válido." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await postApplyReferralCode(raw);
      const fresh = await fetchAuthMe();
      setUser(fresh);
      setCodeInput("");
      setMessage({
        type: "ok",
        text: "¡Listo! Apoyaste a tu referidor con tu registro único. Gracias por sumarte.",
      });
    } catch (e) {
      setMessage({
        type: "err",
        text: parseApiErrorMessage(e, "No pudimos aplicar el código."),
      });
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-surface-elevated px-6 py-12 text-center">
        <p className="text-sm text-muted">Inicia sesión para ver tus referidos.</p>
        <Link
          href="/"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:opacity-95"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Users className="size-3.5" aria-hidden />
          Programa de referidos
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Mis referidos</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Comparte tu código o enlace. Cada persona que se registre con tu referido te habilita{" "}
          <strong className="font-semibold text-foreground">1 publicación destacada activa</strong>.
          También puedes apoyar a otra persona una sola vez con su código.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
          aria-labelledby="referral-slots-heading"
        >
          <h3 id="referral-slots-heading" className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Cupos de destacadas por referidos
          </h3>
          <p className="mt-2 flex flex-wrap items-baseline gap-1 tabular-nums">
            <span className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">{featuredMax}</span>
            <span className="pb-1 text-2xl font-bold text-muted">/</span>
            <span className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {user.referralDirectCount}
            </span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {featuredMax} cupos activos para destacar publicaciones, basados en tus referidos
            válidos ({user.referralDirectCount}).
          </p>
          <div className="mt-4">
            <ProgressBar
              aria-label={`Cupos de destacadas disponibles: ${featuredMax} de ${user.referralDirectCount}`}
              minValue={0}
              maxValue={Math.max(1, user.referralDirectCount)}
              value={featuredMax}
              color="default"
              size="md"
              className="w-full"
            >
              <ProgressBar.Track>
                <ProgressBar.Fill className="bg-primary" />
              </ProgressBar.Track>
            </ProgressBar>
          </div>
        </section>

        <section
          className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
          aria-labelledby="active-quota-heading"
        >
          <h3 id="active-quota-heading" className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Destacadas activas en uso
          </h3>
          <p className="mt-2 flex flex-wrap items-baseline gap-1 tabular-nums">
            <span className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
              {user.featuredActiveCount}
            </span>
            <span className="pb-1 text-2xl font-bold text-muted">/</span>
            <span className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {featuredMax}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted">
            Cada publicación destacada activa consume 1 cupo. Si la pausas o desactivas el destacado,
            el cupo vuelve a estar disponible.
          </p>
          <div className="mt-4">
            <ProgressBar
              aria-label={`Destacadas activas en uso: ${user.featuredActiveCount} de ${featuredMax}`}
              minValue={0}
              maxValue={Math.max(1, featuredMax)}
              value={Math.min(user.featuredActiveCount, Math.max(1, featuredMax))}
              color="default"
              size="md"
              className="w-full"
            >
              <ProgressBar.Track>
                <ProgressBar.Fill className="bg-primary" />
              </ProgressBar.Track>
            </ProgressBar>
            <div className="mt-2 flex justify-end">
              <span className="text-xs tabular-nums text-muted">{featuredQuotaPct}%</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/cuenta/publicaciones"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-foreground transition hover:bg-primary/[0.06]"
            >
              Ir a mis publicaciones
            </Link>
            <Link
              href="/skills/new"
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Crear publicación
            </Link>
          </div>
        </section>
      </div>

      <section
        className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
        aria-labelledby="referred-list-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 id="referred-list-heading" className="text-sm font-semibold text-foreground">
              Personas que se registraron con tu código
            </h3>
            <p className="mt-1 max-w-xl text-xs text-muted">
              Orden de llegada. Cada referido válido suma 1 cupo para destacar publicaciones activas.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full border-border"
            isDisabled={refLoading}
            onPress={() => void reloadReferrals()}
          >
            <RefreshCw className="mr-1.5 size-4" aria-hidden />
            Actualizar
          </Button>
        </div>

        {refLoading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/20" />
            ))}
          </div>
        ) : refError ? (
          <div className="mt-6 rounded-xl border border-border bg-muted/10 px-4 py-4 text-center">
            <p className="text-sm text-muted">No pudimos cargar la lista.</p>
            <Button
              type="button"
              variant="ghost"
              className="mt-3 rounded-full bg-gradient-to-r from-primary to-primary-light px-6 font-semibold text-white shadow-md shadow-primary/25 hover:opacity-95"
              onPress={() => void reloadReferrals()}
            >
              Reintentar
            </Button>
          </div>
        ) : referred.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/[0.04] px-4 py-10 text-center">
            <p className="text-sm text-muted">
              Aún nadie se ha registrado con tu enlace. Copia tu código abajo y compártelo.
            </p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-white">
            {referred.map((row, index) => {
              const countsForCap = index < featuredMax;
              return (
                <li key={row.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{row.fullName?.trim() || "Sin nombre"}</p>
                    <p className="text-xs text-muted">{formatReferralDate(row.createdAt)}</p>
                  </div>
                  <span
                    className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      countsForCap
                        ? "bg-success/15 text-success"
                        : "bg-muted/30 text-muted"
                    }`}
                  >
                    {countsForCap ? "Habilita 1 destacada" : "Fuera de cupo aplicable"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Share2 className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Tu código</h3>
              <p className="mt-1 text-xs text-muted">Compártelo tal cual o usa el enlace listo para enviar.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="block rounded-xl border border-border bg-muted/10 px-4 py-3 text-center text-lg font-bold tracking-widest text-foreground sm:min-w-[200px]">
                {myCode || "—"}
              </code>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full bg-gradient-to-r from-primary to-primary-light px-6 font-semibold text-white shadow-md shadow-primary/25 hover:opacity-95"
                  onPress={() => myCode && void copyText(myCode, "code")}
                  isDisabled={!myCode}
                >
                  {copied === "code" ? "Copiado" : "Copiar código"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-border"
                  onPress={() => link && void copyText(link, "link")}
                  isDisabled={!link}
                >
                  <Link2 className="mr-1.5 size-4" aria-hidden />
                  {copied === "link" ? "Enlace copiado" : "Copiar enlace"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
            <Gift className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Apoya a alguien</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Solo puedes hacerlo <strong className="font-semibold text-foreground">una vez</strong>. Al guardar,
                quedarás vinculado a ese referidor y él recibirá un cupo de destacada. No puedes usar
                tu propio código.
              </p>
            </div>
            {user.hasReferredBy ? (
              <p className="rounded-xl bg-muted/15 px-4 py-3 text-sm text-foreground">
                Ya registraste un código de referido. ¡Gracias por apoyar a la comunidad!
              </p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor="referral-apply-code" className="text-sm font-medium">
                    Código de otra persona
                  </Label>
                  <Input
                    id="referral-apply-code"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="EJEMPLO123"
                    className="h-11 rounded-xl border-border font-mono uppercase tracking-wide"
                    autoComplete="off"
                    maxLength={16}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 shrink-0 rounded-full bg-gradient-to-r from-primary to-primary-light px-6 font-semibold text-white shadow-md shadow-primary/25 hover:opacity-95"
                  onPress={() => void onApplyReferral()}
                  isDisabled={busy || codeInput.trim().length < 4}
                >
                  {busy ? "Guardando…" : "Afiliar código"}
                </Button>
              </div>
            )}
            <div aria-live="polite" className="min-h-[1.25rem] text-sm">
              {message ? (
                <p className={message.type === "ok" ? "text-success" : "text-accent-red"}>{message.text}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
