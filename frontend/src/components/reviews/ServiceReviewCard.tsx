"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import type { ServiceReviewPublic } from "@/types/service-review.types";
import { ReviewStarsDisplay } from "./ReviewStarsDisplay";

const MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return `el ${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

function avatarHue(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h + name.charCodeAt(i) * 17) % 360;
  }
  return `hsl(${h} 65% 45%)`;
}

function initialLetter(name: string): string {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() : "?";
}

export function ServiceReviewCard({ review }: { review: ServiceReviewPublic }) {
  const href = `/servicios/${review.serviceId}`;
  const dateStr = formatReviewDate(review.createdAt);

  return (
    <article className="rounded-2xl border border-border bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
          {review.avatarUrl ? (
            <Image
              src={review.avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: avatarHue(review.authorName) }}
            >
              {initialLetter(review.authorName)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <span className="font-semibold text-foreground">{review.authorName}</span>
            <span className="text-muted">en 🇵🇪 Perú</span>
            {dateStr ? <span className="text-muted">{dateStr}</span> : null}
            {review.isVerifiedPurchase ? (
              <span
                className="inline-flex items-center gap-0.5 rounded-full border border-success/50 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success"
                title="Compra verificada: conversación con el vendedor por este servicio"
              >
                <ShieldCheck className="size-3" aria-hidden />
                Verificada
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ReviewStarsDisplay rating={review.rating} />
        <span className="text-sm font-semibold text-primary-dark">{review.ratingLabel}</span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{review.body}</p>

      <Link
        href={href}
        className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-surface-elevated px-3 py-2.5 text-left text-sm text-muted no-underline transition hover:bg-muted/60"
      >
        <span>
          <span className="text-muted">Esta reseña es para:</span>{" "}
          <span className="font-medium text-foreground">{review.serviceTitle}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
      </Link>
    </article>
  );
}
