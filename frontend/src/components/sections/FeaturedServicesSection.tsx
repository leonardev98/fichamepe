"use client";

import { Star } from "lucide-react";
import { ServiceCard } from "@/components/cards/ServiceCard";
import type { ServicePublic } from "@/types/service.types";

export function FeaturedServicesSection({ services }: { services: ServicePublic[] }) {
  if (!services.length) return null;

  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            <Star className="size-3.5" aria-hidden />
            Destacados por la comunidad
          </p>
          <h2 className="text-2xl font-bold text-foreground">Primero lo más recomendado</h2>
        </div>
        <p className="text-xs text-muted">1 referido = 1 destacada activa</p>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {services.slice(0, 4).map((service, index) => (
          <div key={service.id} className="h-full min-h-0">
            <ServiceCard service={service} coverPriority={index === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
