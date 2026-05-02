"use client";

import { Building2, MapPin, Sparkles, X } from "lucide-react";

type CoworkingConversationPromptProps = {
  onOpenSpaces: () => void;
  onDismiss: () => void;
};

export function CoworkingConversationPrompt({
  onOpenSpaces,
  onDismiss,
}: CoworkingConversationPromptProps) {
  return (
    <aside className="relative overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm ring-1 ring-primary/[0.04]">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-primary-light to-accent" />
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2.5 top-2.5 inline-flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-primary/5 hover:text-foreground"
        aria-label="Cerrar recomendacion de coworking"
      >
        <X className="size-4" aria-hidden />
      </button>

      <div className="grid gap-4 p-4 pr-12 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 className="size-6" aria-hidden />
        </span>

        <div className="min-w-0">
          <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
            <Sparkles className="size-3" aria-hidden />
            Recomendado para esta conversacion
          </div>
          <h3 className="font-heading text-base font-bold tracking-tight text-foreground">
            Reunanse en un coworking profesional
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Elijan un espacio comodo, seguro y bien ubicado para coordinar el proyecto en persona.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSpaces}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark sm:w-auto"
        >
          <MapPin className="size-4" aria-hidden />
          Ver espacios cercanos
        </button>
      </div>
    </aside>
  );
}
