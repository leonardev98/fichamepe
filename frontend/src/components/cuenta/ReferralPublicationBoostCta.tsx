"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { ProgressBar } from "@heroui/react/progress-bar";
import type { AuthUser } from "@/types/auth";

type Props = {
  user: AuthUser;
};

export function ReferralPublicationBoostCta({ user }: Props) {
  const featuredMax = Math.max(0, user.featuredActiveMax ?? user.referralDirectCount ?? 0);
  const featuredUsed = Math.max(0, user.featuredActiveCount ?? 0);

  return (
    <section
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-surface to-primary-light/[0.04] p-5 shadow-sm sm:p-6"
      aria-labelledby="referral-boost-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner shadow-primary/10">
            <Users className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <h3 id="referral-boost-heading" className="text-base font-bold tracking-tight text-foreground">
              Impulsa tus destacadas con referidos
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              Cada referido te habilita 1 publicación destacada activa para ganar visibilidad en la
              parte superior del home.
            </p>
          </div>
        </div>
        <Link
          href="/cuenta/referidos"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-white px-5 text-sm font-semibold text-primary no-underline transition hover:bg-primary/5 sm:self-center"
        >
          Ir a Mis referidos
        </Link>
      </div>

      <div className="mt-5 space-y-2 border-t border-primary/15 pt-4">
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span className="font-medium text-foreground">Destacadas activas en uso</span>
          <span className="shrink-0 tabular-nums">
            {featuredUsed}/{featuredMax}
          </span>
        </div>
        <ProgressBar
          aria-label={`Destacadas activas: ${featuredUsed} de ${featuredMax}`}
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
    </section>
  );
}
