"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  RefreshCw,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { ProgressBar } from "@heroui/react/progress-bar";
import { Separator } from "@heroui/react/separator";
import { PublicationSlotsPurchasePanel } from "@/components/cuenta/PublicationSlotsPurchasePanel";
import { fetchAuthMe, parseApiErrorMessage } from "@/lib/api/auth.api";
import {
  fetchMySubscription,
  postPendingSubscription,
  type SubscriptionRow,
} from "@/lib/api/subscriptions.api";
import { useAuthStore } from "@/store/auth.store";

function SummaryStatCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      variant="default"
      className={`h-full border border-border/90 bg-muted/[0.02] p-4 shadow-none transition-colors hover:border-primary/20 ${className}`}
    >
      <Card.Header className="flex flex-row items-start gap-3 border-0 p-0">
        <span className="mt-0.5 shrink-0 text-primary [&_svg]:size-4" aria-hidden>
          {icon}
        </span>
        <div className="min-w-0 space-y-1.5">
          <Card.Title className="text-[11px] font-bold uppercase tracking-wide text-muted">{title}</Card.Title>
          <Card.Description className="p-0 text-sm leading-relaxed text-foreground">{children}</Card.Description>
        </div>
      </Card.Header>
    </Card>
  );
}

type AuthUserLite = {
  referralDirectCount: number;
  featuredActiveCount: number;
  featuredActiveMax: number;
};

function ReferralsSummaryCard({ user }: { user: AuthUserLite }) {
  const router = useRouter();
  const featuredMax = Math.max(0, user.featuredActiveMax ?? user.referralDirectCount ?? 0);
  const featuredUsed = Math.max(0, user.featuredActiveCount ?? 0);

  return (
    <Card
      variant="default"
      className="border border-primary/25 bg-gradient-to-br from-primary/[0.07] via-surface to-primary-light/[0.04] p-4 shadow-sm"
    >
      <Card.Header className="space-y-0 border-0 p-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner shadow-primary/10">
              <Users className="size-5" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 space-y-1">
              <Card.Title className="text-base font-bold text-foreground">Referidos</Card.Title>
              <Card.Description className="text-xs leading-relaxed text-muted">
                Cada referido válido te habilita 1 publicación destacada activa para aparecer arriba
                en el home.
              </Card.Description>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full shrink-0 rounded-full border-primary/30 font-semibold text-primary sm:w-auto"
            onPress={() => router.push("/cuenta/referidos")}
          >
            Programa de referidos
          </Button>
        </div>
      </Card.Header>

      <Separator className="my-4 bg-border" />

      <Card.Content className="space-y-4 border-0 p-0">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl border border-border/80 bg-surface/90 px-2 py-3 text-center sm:px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Personas</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground sm:text-2xl">
              {user.referralDirectCount}
            </p>
            <p className="mt-0.5 text-[10px] text-muted">referidas</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-surface/90 px-2 py-3 text-center sm:px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Cupos destacadas</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-foreground sm:text-2xl">
              {featuredMax}
            </p>
            <p className="mt-0.5 text-[10px] text-muted">disponibles</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/[0.06] px-2 py-3 text-center sm:px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">En uso</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-primary sm:text-2xl">{featuredUsed}</p>
            <p className="mt-0.5 text-[10px] text-muted">destacadas activas</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs text-muted">
            <span className="font-medium text-foreground">Uso de destacadas</span>
            <span className="shrink-0 tabular-nums text-muted">
              {featuredUsed}/{featuredMax}
            </span>
          </div>
          <ProgressBar
            aria-label="Uso de publicaciones destacadas por referidos"
            minValue={0}
            maxValue={Math.max(1, featuredMax)}
            value={Math.min(featuredUsed, Math.max(1, featuredMax))}
            color="default"
            size="sm"
            className="w-full"
          >
            <ProgressBar.Track>
              <ProgressBar.Fill className="bg-primary" />
            </ProgressBar.Track>
          </ProgressBar>
        </div>
      </Card.Content>
    </Card>
  );
}

type ProPlanPricingCardProps = {
  subRow: SubscriptionRow | null | undefined;
  hideProRequestForm: boolean;
  subBusy: boolean;
  requestProPlan: () => Promise<void>;
  subMsg: { type: "ok" | "err"; text: string } | null;
  isProUser: boolean;
  publicationBaseActiveMax: number;
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-PE", { dateStyle: "medium" });
  } catch {
    return iso;
  }
}

function subscriptionStatusLabel(status: SubscriptionRow["status"]): string {
  switch (status) {
    case "active":
      return "Activa";
    case "pending_payment":
      return "Pendiente de pago";
    case "expired":
      return "Expirada";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

function ProFeatureRow({ Icon, title, subtitle }: { Icon: LucideIcon; title: string; subtitle?: string }) {
  return (
    <li className="flex gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary"
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 pt-0.5">
        <span className="block text-sm font-semibold leading-snug text-foreground">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted">{subtitle}</span>
        ) : null}
      </span>
    </li>
  );
}

function ProPlanPricingCard({
  subRow,
  hideProRequestForm,
  subBusy,
  requestProPlan,
  subMsg,
  isProUser,
  publicationBaseActiveMax,
}: ProPlanPricingCardProps) {
  const proActiveCap = Math.max(0, publicationBaseActiveMax);

  const planBadge =
    "inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary";

  const cardShell =
    "relative h-full min-h-0 flex-col gap-0 overflow-hidden border-2 border-primary/45 bg-gradient-to-br from-primary/[0.14] via-surface to-primary-light/[0.08] p-5 shadow-xl shadow-primary/20 ring-1 ring-primary/15 transition-shadow before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-primary before:via-primary-light before:to-primary before:opacity-90 hover:shadow-2xl hover:shadow-primary/25 md:scale-[1.02]";

  return (
    <Card variant="default" className={cardShell} aria-labelledby="plan-pro-card-title">
      <Card.Header className="relative z-[1] border-0 p-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-inner shadow-primary/10">
              <Zap className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={planBadge}>Plan 2</span>
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm shadow-primary/30">
                  Destacado
                </span>
              </div>
              <Card.Title id="plan-pro-card-title" className="mt-2 text-base font-bold text-foreground">
                Plan Pro
              </Card.Title>
              <Card.Description className="mt-1 text-sm font-medium leading-snug text-foreground">
                Multiplica tu visibilidad y consigue más clientes.
              </Card.Description>
            </div>
          </div>
          <span className="rounded-full border border-primary/25 bg-surface/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary backdrop-blur-sm">
            Marketplace
          </span>
        </div>

        <p className="mt-4 text-3xl font-extrabold tabular-nums text-foreground">
          S/&nbsp;25<span className="text-base font-semibold text-muted">/mes</span>
        </p>
      </Card.Header>

      <Card.Content className="flex flex-1 flex-col border-0 px-0 pt-4 pb-0">
        <ul className="min-h-0 flex-1 space-y-3 border-t border-border pt-4">
          <ProFeatureRow Icon={Zap} title={`Hasta ${proActiveCap} publicaciones activas`} />
          <ProFeatureRow Icon={RefreshCw} title="Publica y rota cuando quieras" />
          <ProFeatureRow Icon={Megaphone} title="Más exposición = más contactos" />
          <ProFeatureRow Icon={Sparkles} title="Mantienes tus extras comprados" />
        </ul>
        <p
          className="mt-4 rounded-xl border border-primary/25 bg-primary/[0.06] px-3 py-2.5 text-xs leading-relaxed text-muted"
          role="note"
        >
          Si cancelas o no renuevas el Pro, vuelves a{" "}
          <span className="tabular-nums font-semibold text-foreground">{publicationBaseActiveMax}</span> publicaciones
          activas. Tus fichas y compras permanentes no se pierden.
        </p>
      </Card.Content>

      <Card.Footer className="mt-auto flex-col gap-3 border-0 p-0 pt-4">
        <div className="space-y-3">
          {subRow === undefined ? (
            <p className="text-sm text-muted">Cargando estado de suscripción…</p>
          ) : subRow && subRow.status === "active" ? (
            <p className="rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-sm text-foreground">
              Suscripción <strong>activa</strong>. Monto: S/ {subRow.amount}.
              {subRow.expiresAt ? (
                <>
                  {" "}
                  Periodo hasta <span className="tabular-nums font-medium">{fmtDate(subRow.expiresAt)}</span>.
                </>
              ) : null}
            </p>
          ) : subRow && subRow.status === "pending_payment" ? (
            <div className="rounded-xl border border-primary/35 bg-primary/[0.07] px-3 py-2 text-sm text-foreground">
              Solicitud <strong>pendiente de pago</strong> (ref.{" "}
              <span className="font-mono text-xs">{subRow.id.slice(0, 8)}…</span>). Te activamos al verificar el
              comprobante.
            </div>
          ) : subRow ? (
            <p className="text-sm text-muted">
              Último registro: <strong className="text-foreground">{subscriptionStatusLabel(subRow.status)}</strong>.
            </p>
          ) : null}
        </div>

        {subRow !== undefined && !hideProRequestForm ? (
          <div className="space-y-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="primary"
              className="w-full rounded-full bg-primary font-semibold text-white shadow-md shadow-primary/20 hover:opacity-95"
              isDisabled={subBusy}
              onPress={() => void requestProPlan()}
            >
              {subBusy ? "Enviando…" : "Activar Pro"}
            </Button>
          </div>
        ) : null}
        {subRow !== undefined && subRow?.status === "active" && isProUser ? (
          <p className="text-xs text-muted">Tu Pro está vigente; no necesitas otra solicitud ahora.</p>
        ) : null}
        {subMsg ? (
          <p
            className={`rounded-xl px-3 py-2 text-sm ${
              subMsg.type === "ok"
                ? "border border-success/25 bg-success/10 text-foreground"
                : "border border-accent-red/25 bg-accent-red/10 text-foreground"
            }`}
            role="status"
          >
            {subMsg.text}
          </p>
        ) : null}
      </Card.Footer>
    </Card>
  );
}

export function CuentaPlanClient() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [subRow, setSubRow] = useState<SubscriptionRow | null | undefined>(undefined);
  const [subBusy, setSubBusy] = useState(false);
  const [subMsg, setSubMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadSub = async () => {
    try {
      setSubRow(await fetchMySubscription());
    } catch {
      setSubRow(null);
    }
  };

  useEffect(() => {
    void loadSub();
  }, []);

  const requestProPlan = async () => {
    setSubBusy(true);
    setSubMsg(null);
    try {
      await postPendingSubscription({
        plan: "pro",
        amount: "25.00",
        paymentMethod: "manual",
      });
      const me = await fetchAuthMe();
      setUser(me);
      await loadSub();
      setSubMsg({
        type: "ok",
        text:
          "Solicitud de plan mensual registrada. Envía tu comprobante de pago (S/ 25) por el canal que te indique el equipo; cuando activen la suscripción, verás el tope ampliado en tu cuenta.",
      });
    } catch (e) {
      setSubMsg({
        type: "err",
        text: parseApiErrorMessage(e, "No pudimos registrar la solicitud."),
      });
    } finally {
      setSubBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-surface-elevated px-6 py-12 text-center">
        <p className="text-sm text-muted">Inicia sesión para ver planes y publicaciones.</p>
        <Link
          href="/auth/login"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white no-underline transition hover:opacity-95"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const hideProRequestForm =
    user.isPublicationExempt ||
    (subRow !== undefined && subRow !== null && subRow.status === "pending_payment") ||
    (subRow !== undefined && subRow !== null && subRow.status === "active" && user.isPro);

  const publicationBaseActiveMax = user.publicationBaseActiveMax ?? user.publicationActiveMax ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-8">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Cuenta</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Planes y publicaciones</h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted sm:mx-0">
          Publicar ahora es <strong className="font-semibold text-foreground">ilimitado</strong>.
          Usa esta sección para entender beneficios de visibilidad y referidos.
        </p>
      </header>

      <Card variant="default" className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <Card.Header className="flex flex-col gap-4 border-b border-border bg-muted/[0.02] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LayoutDashboard className="size-6" aria-hidden />
            </span>
            <div>
              <Card.Title className="text-base font-bold text-foreground">Tu resumen de publicaciones</Card.Title>
              <Card.Description className="text-xs text-muted">Resumen en tiempo real desde tu sesión.</Card.Description>
            </div>
          </div>
          {!user.isPublicationExempt && user.publicationActiveMax != null ? (
            <div className="rounded-2xl border border-primary/25 bg-primary/[0.08] px-5 py-3 text-center shadow-inner shadow-primary/5 sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Activas ahora</p>
              <p className="text-2xl font-extrabold tabular-nums text-foreground">
                {user.publicationActiveCount}
                <span className="text-lg font-bold text-muted">/{user.publicationActiveMax}</span>
              </p>
            </div>
          ) : null}
        </Card.Header>

        <Card.Content className="p-5 sm:p-6">
          {user.isPublicationExempt ? (
            <p className="text-sm text-muted">Tu cuenta no tiene límite práctico de publicaciones activas.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <ReferralsSummaryCard user={user} />
              </div>

              <SummaryStatCard icon={<CheckCircle2 className="text-success" />} title="Fichas en cuenta">
                <span className="tabular-nums font-semibold">{user.publicationCount}</span> en total (todos los
                estados).{" "}
                <Link href="/cuenta/publicaciones" className="font-medium text-primary underline-offset-2 hover:underline">
                  Mis publicaciones
                </Link>
              </SummaryStatCard>

              <SummaryStatCard icon={<CreditCard className="text-primary" />} title="Extras de pago único">
                <span className="tabular-nums font-semibold">{user.purchasedPublicationSlots}</span>{" "}
                publicaciones activas <strong className="font-semibold">permanentes</strong> sumadas a tu cuenta.
              </SummaryStatCard>

              <SummaryStatCard
                className="sm:col-span-2"
                icon={<Sparkles className="text-primary" />}
                title="Plan Pro en tu perfil"
              >
                {user.isPro ? (
                  <span>
                    Estado: <strong className="text-success">Activo</strong>
                    {user.proExpiresAt ? (
                      <>
                        {" "}
                        hasta <span className="tabular-nums">{fmtDate(user.proExpiresAt)}</span>
                      </>
                    ) : null}
                    .
                  </span>
                ) : (
                  <span>
                    Aún <strong className="text-muted">no tienes Pro</strong>. Actívalo abajo para ampliar tu vitrina.
                  </span>
                )}
              </SummaryStatCard>
            </div>
          )}
        </Card.Content>
      </Card>

      <section
        id="ampliar-publicaciones"
        className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-8"
      >
        <header className="border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Estado actual</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Publicaciones ilimitadas activas
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Mientras integramos métodos de pago, no hay límites de publicaciones. Para salir arriba
            en home, usa destacadas con referidos.
          </p>
        </header>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <SummaryStatCard icon={<Users className="text-primary" />} title="Regla de destacados">
            <span className="font-semibold text-foreground">1 referido = 1 destacada activa</span>.
            Gestiona tus cupos en{" "}
            <Link href="/cuenta/referidos" className="font-medium text-primary underline-offset-2 hover:underline">
              Mis referidos
            </Link>
            .
          </SummaryStatCard>
          <SummaryStatCard icon={<CreditCard className="text-primary" />} title="Métodos de pago">
            Estamos terminando la integración. Las cards de planes se mantendrán como referencia
            visual.
          </SummaryStatCard>
        </div>
      </section>
    </div>
  );
}
