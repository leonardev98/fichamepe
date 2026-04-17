"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3, Tag } from "lucide-react";
import { ConversationServiceCover } from "@/components/conversaciones/ConversationServiceCover";
import type { ConversationPerspective } from "@/components/conversaciones/conversation-utils";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import type { ConversationThread } from "@/types/conversation.types";

function listingFallbackInitials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
  }
  const single = title.trim();
  return (single.slice(0, 2) || "FP").toUpperCase();
}

type ConversationServiceSummaryCardProps = {
  conversation: ConversationThread;
  perspective?: ConversationPerspective | null;
  compact?: boolean;
};

export function ConversationServiceSummaryCard({
  conversation,
  perspective = null,
  compact = false,
}: ConversationServiceSummaryCardProps) {
  const serviceId = conversation.serviceId;
  const isClientRequest = conversation.threadKind === "client_request";
  const clientRequestId = conversation.clientRequestId;

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-gradient-to-br from-white via-white to-primary/[0.04] shadow-sm ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className={`flex gap-3 ${compact ? "" : "sm:gap-4"}`}>
        <ConversationServiceCover
          coverUrl={conversation.serviceCoverImageUrl}
          serviceTitle={conversation.serviceTitle}
          initialsFallback={listingFallbackInitials(conversation.serviceTitle)}
          perspective={perspective}
          size={compact ? "sm" : "md"}
        />
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold leading-snug text-foreground ${
              compact ? "text-sm line-clamp-2" : "text-sm sm:text-base line-clamp-2"
            }`}
          >
            {conversation.serviceTitle}
          </p>
          {!isClientRequest ? (
            <div className="mt-2">
              <PriceDisplay
                price={conversation.servicePrice}
                previousPrice={conversation.servicePreviousPrice}
              />
            </div>
          ) : (
            <p className="mt-2 text-sm font-medium text-muted">Solicitud de trabajo (sin precio fijo)</p>
          )}
          {!isClientRequest && (conversation.serviceCategory || conversation.serviceDeliveryTime) ? (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
              {conversation.serviceCategory ? (
                <span className="inline-flex items-center gap-1">
                  <Tag className="size-3 shrink-0 text-primary/70" aria-hidden />
                  {conversation.serviceCategory}
                </span>
              ) : null}
              {conversation.serviceCategory && conversation.serviceDeliveryTime ? (
                <span className="text-border" aria-hidden>
                  ·
                </span>
              ) : null}
              {conversation.serviceDeliveryTime ? (
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3 shrink-0 text-primary/70" aria-hidden />
                  {conversation.serviceDeliveryTime}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
      {isClientRequest && clientRequestId ? (
        <Link
          href={`/solicitar/${clientRequestId}`}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.07] py-2.5 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/10 ${
            compact ? "text-xs py-2" : ""
          }`}
        >
          Ver solicitud
          <ArrowUpRight className="size-4 shrink-0 opacity-90" aria-hidden />
        </Link>
      ) : serviceId ? (
        <Link
          href={`/servicios/${serviceId}`}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/[0.07] py-2.5 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/10 ${
            compact ? "text-xs py-2" : ""
          }`}
        >
          Ver publicación
          <ArrowUpRight className="size-4 shrink-0 opacity-90" aria-hidden />
        </Link>
      ) : (
        <p className="mt-3 text-center text-[11px] text-muted">
          Este chat no tiene un enlace al anuncio guardado.
        </p>
      )}
    </div>
  );
}
