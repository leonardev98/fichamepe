"use client";

import { ArrowLeft, CheckCircle2, Clock3, MapPin, UsersRound } from "lucide-react";
import type { CoworkingSpace } from "@/lib/coworking/mockCoworkingSpaces";

type CoworkingSpacesPanelProps = {
  spaces: CoworkingSpace[];
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string) => void;
  onBack: () => void;
};

export function CoworkingSpacesPanel({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  onBack,
}: CoworkingSpacesPanelProps) {
  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId) ?? null;

  return (
    <section className="rounded-2xl border border-border bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Volver al chat
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Espacios aliados
          </p>
          <h3 className="mt-1 font-heading text-xl font-extrabold tracking-tight text-foreground">
            Coworkings disponibles en Lima
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Elige una sede tentativa. Para esta demo, registramos el interes y mostramos como se
            veria el siguiente paso comercial.
          </p>
        </div>
      </header>

      <div className="grid gap-3 p-4 lg:grid-cols-3">
        {spaces.map((space) => {
          const selected = space.id === selectedSpaceId;

          return (
            <article
              key={space.id}
              className={`overflow-hidden rounded-2xl border bg-surface transition ${
                selected ? "border-primary shadow-md ring-2 ring-primary/15" : "border-border hover:border-primary/30"
              }`}
            >
              <div className={`h-24 bg-gradient-to-br ${space.imageGradient}`} />
              <div className="space-y-4 p-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {space.areaLabel}
                    </span>
                    <span className="text-xs font-medium text-muted">{space.district}</span>
                  </div>
                  <h4 className="mt-3 font-heading text-base font-bold text-foreground">
                    {space.name}
                  </h4>
                  <p className="mt-2 flex gap-2 text-sm leading-relaxed text-muted">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {space.address}
                  </p>
                </div>

                <div className="grid gap-2 text-sm text-muted">
                  <p className="flex items-center gap-2">
                    <UsersRound className="size-4 text-primary" aria-hidden />
                    {space.capacity}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="size-4 text-primary" aria-hidden />
                    {space.availability}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {space.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">{space.priceHint}</p>
                  <button
                    type="button"
                    onClick={() => onSelectSpace(space.id)}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      selected
                        ? "bg-success text-white"
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
                  >
                    {selected ? <CheckCircle2 className="size-4" aria-hidden /> : null}
                    {selected ? "Espacio elegido" : "Me interesa este espacio"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selectedSpace ? (
        <div className="mx-4 mb-4 rounded-2xl border border-success/20 bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
            <div>
              <p className="font-semibold">Interes registrado por {selectedSpace.name}</p>
              <p className="mt-1 leading-relaxed">
                En breve se contactaran con ustedes para recomendar el mejor espacio, horario y
                formato de reunion. Esta version es demostrativa y no envia datos externos todavia.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
