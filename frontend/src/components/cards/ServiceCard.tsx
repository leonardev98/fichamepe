"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Eye, MessageCircle, MoreVertical, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Dropdown } from "@heroui/react/dropdown";
import { Badge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { OnlineIndicator } from "@/components/ui/OnlineIndicator";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { StarRating } from "@/components/ui/StarRating";
import { SKILL_CATEGORIES } from "@/components/skills/skill-wizard.constants";
import { isActivePromo } from "@/lib/service-promo";
import type { ServicePublic } from "@/types/service.types";

type ServiceCardProps = {
  service: ServicePublic;
  /** Portada above-the-fold: prioriza carga (evita aviso LCP de Next/Image). */
  coverPriority?: boolean;
  /** Oculta favoritos (p. ej. en “mis publicaciones”). */
  hideFavorite?: boolean;
  /** Muestra “Pausado” si el servicio está inactivo. */
  showActiveStatus?: boolean;
  onEdit?: (service: ServicePublic) => void;
  onPause?: (service: ServicePublic) => void;
  onReactivate?: (service: ServicePublic) => void;
  onPublish?: (service: ServicePublic) => void;
  onDelete?: (service: ServicePublic) => void;
};

function publicationStatusChip(service: ServicePublic): {
  label: string;
  dotClass: string | null;
  labelClass: string;
} {
  if (service.status === "ACTIVA") {
    return {
      label: "Activa",
      dotClass: "bg-success ring-2 ring-success/30 shadow-[0_0_10px_rgba(16,185,129,0.65)]",
      labelClass: "text-success",
    };
  }
  if (service.status === "PAUSADA") {
    return {
      label: "Pausada",
      dotClass: "bg-accent ring-2 ring-accent/35 shadow-[0_0_10px_rgba(245,158,11,0.55)]",
      labelClass: "text-primary-dark",
    };
  }
  if (service.status === "EN_REVISION") {
    return {
      label: "En revisión",
      dotClass: "bg-primary ring-2 ring-primary/30 shadow-[0_0_10px_rgba(123,97,255,0.55)]",
      labelClass: "text-primary",
    };
  }
  if (service.status === "REQUIERE_CAMBIOS") {
    return {
      label: "Requiere cambios",
      dotClass: "bg-accent-red ring-2 ring-accent-red/35 shadow-[0_0_10px_rgba(239,68,68,0.55)]",
      labelClass: "text-accent-red",
    };
  }
  return {
    label: "Borrador",
    dotClass: "bg-muted ring-2 ring-border",
    labelClass: "text-muted",
  };
}

export function ServiceCard({
  service,
  coverPriority,
  hideFavorite,
  showActiveStatus,
  onEdit,
  onPause,
  onReactivate,
  onPublish,
  onDelete,
}: ServiceCardProps) {
  const profile = service.profile;
  const hasServiceReviews = (service.reviewCount ?? 0) > 0;
  const rating = hasServiceReviews
    ? (service.reviewAverage ?? 0)
    : (profile?.rating ?? 4.6);
  const reviews = hasServiceReviews ? (service.reviewCount ?? 0) : (profile?.reviewCount ?? 12);
  const categoryLabel =
    SKILL_CATEGORIES.find((c) => c.id === service.category)?.label ??
    service.tags[0] ??
    "Servicio destacado";
  const statusChip = publicationStatusChip(service);
  const showActions = Boolean(onEdit || onPause || onReactivate || onPublish || onDelete);
  const viewCount = service.viewCount ?? 0;
  const hasViews = viewCount > 0;
  const cardHref = `/servicios/${service.id}`;
  const sellerProfileHref = service.profileId ? `/perfil/${service.profileId}` : null;

  const hasCoverImage = Boolean(service.coverImageUrl);

  const cardBody = (
    <>
      <Link href={cardHref} className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-surface-elevated no-underline">
        {service.coverImageUrl ? (
          <>
            <Image
              src={service.coverImageUrl}
              alt={service.title}
              fill
              priority={Boolean(coverPriority)}
              loading={coverPriority ? "eager" : "lazy"}
              fetchPriority={coverPriority ? "high" : undefined}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1536px) 50vw, 33vw"
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-32 bg-gradient-to-b from-black/50 via-black/20 to-transparent"
              aria-hidden
            />
            {!showActiveStatus ? (
              <p className="pointer-events-none absolute bottom-2 left-2 z-[5] max-w-[calc(100%-1rem)] truncate rounded-md bg-black/45 px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                {categoryLabel}
              </p>
            ) : null}
          </>
        ) : (
          <div
            className={`fp-gradient-bg relative flex h-full w-full flex-col justify-end p-4 ${
              showActiveStatus ? "pb-10" : ""
            }`}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/[0.12] via-transparent to-transparent"
              aria-hidden
            />
            {!showActiveStatus ? (
              <p className="relative text-left text-xs font-semibold uppercase tracking-wide text-primary/80">
                {categoryLabel}
              </p>
            ) : null}
          </div>
        )}
        <div className="absolute left-2 top-2 z-20 flex max-w-[calc(100%-3.5rem)] flex-wrap items-center gap-1.5">
          {service.isFeatured ? (
            <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Destacado
            </span>
          ) : null}
          {service.badge ? <Badge badge={service.badge} overlay={hasCoverImage} /> : null}
          <CountdownTimer
            endsAt={isActivePromo(service) ? service.flashDealEndsAt : null}
            overlay={hasCoverImage}
          />
        </div>
        {!hideFavorite ? (
          <div className="absolute right-2 top-2 z-20">
            <FavoriteButton serviceId={service.id} overlay={hasCoverImage} />
          </div>
        ) : null}
        {showActiveStatus ? (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-[22] px-2.5 pb-2.5 pt-11 ${
              hasCoverImage
                ? "bg-gradient-to-t from-black/80 via-black/50 to-transparent"
                : "bg-gradient-to-t from-primary-dark/35 via-primary/[0.12] to-transparent"
            }`}
          >
            <span className="inline-flex max-w-full items-center gap-2 rounded-xl border-2 border-white/90 bg-white px-3 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.28)]">
              <span
                className={`size-2 shrink-0 rounded-full ${statusChip.dotClass}`}
                aria-hidden
              />
              <span
                className={`truncate text-[13px] font-extrabold leading-none tracking-tight ${statusChip.labelClass}`}
              >
                {statusChip.label}
              </span>
            </span>
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 items-start justify-between gap-2.5">
          <Link
            href={cardHref}
            className="min-w-0 flex-1 text-[15px] font-bold leading-snug tracking-tight text-foreground no-underline transition hover:text-primary sm:text-base sm:leading-tight"
          >
            <span className="line-clamp-2 break-words [overflow-wrap:anywhere]">{service.title}</span>
          </Link>
          {profile?.isVerified ? (
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          ) : null}
        </div>

        {sellerProfileHref ? (
          <Link
            href={sellerProfileHref}
            className="flex items-center gap-2.5 no-underline"
            aria-label={`Ver perfil de ${profile?.displayName ?? "Freelancer"}`}
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-2 ring-white">
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="absolute inset-0 bg-gradient-to-br from-primary/25 to-primary/5"
                  aria-hidden
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground transition group-hover:text-primary">
                {profile?.displayName ?? "Freelancer"}
              </p>
              <OnlineIndicator
                isOnline={profile?.isAvailable ?? false}
                responseTimeHours={profile?.responseTimeHours}
              />
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-2 ring-white">
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="absolute inset-0 bg-gradient-to-br from-primary/25 to-primary/5"
                  aria-hidden
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {profile?.displayName ?? "Freelancer"}
              </p>
              <OnlineIndicator
                isOnline={profile?.isAvailable ?? false}
                responseTimeHours={profile?.responseTimeHours}
              />
            </div>
          </div>
        )}

        <p className="line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-muted">
          {service.description.trim() ? service.description : "\u00a0"}
        </p>
        {service.status === "REQUIERE_CAMBIOS" && service.moderationComment ? (
          <div className="rounded-xl border border-accent-red/25 bg-accent-red/5 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-red">
              Observación de revisión
            </p>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-foreground/80">
              {service.moderationComment}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <StarRating rating={rating} reviewCount={reviews} />
          <span className="inline-flex items-center gap-1 text-muted">
            <MessageCircle className="size-3.5 shrink-0" aria-hidden />
            +{service.weeklyHires ?? 0} esta semana
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {service.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const content = (
    <div className="flex min-h-0 flex-1 flex-col">
      {cardBody}
      <div className="mx-4 mb-4 mt-auto flex items-end justify-between gap-3 border-t border-border pt-3 sm:mx-5">
        <PriceDisplay variant="card" price={service.price} previousPrice={service.previousPrice} />
        <div className="flex items-center gap-2">
          <p
            className={`inline-flex shrink-0 items-center gap-1 ${
              hasViews
                ? "gap-1.5 text-sm font-semibold tabular-nums text-foreground"
                : "text-[11px] text-muted"
            }`}
          >
            <Eye
              className={hasViews ? "size-4 shrink-0 text-primary" : "size-3.5 shrink-0"}
              aria-hidden
            />
            <span>
              {viewCount} {viewCount === 1 ? "vista" : "vistas"}
            </span>
          </p>
          {showActions ? (
            <Dropdown>
              <Dropdown.Trigger
                aria-label="Acciones de publicación"
                className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <MoreVertical className="size-4" aria-hidden />
              </Dropdown.Trigger>
              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu aria-label="Acciones de habilidad">
                  {onEdit ? (
                    <Dropdown.Item key="edit" className="cursor-pointer" onAction={() => onEdit(service)}>
                      <span className="inline-flex items-center gap-2">
                        <Pencil className="size-4" aria-hidden />
                        Editar
                      </span>
                    </Dropdown.Item>
                  ) : null}
                  {service.status === "ACTIVA" && onPause ? (
                    <Dropdown.Item key="pause" className="cursor-pointer" onAction={() => onPause(service)}>
                      <span className="inline-flex items-center gap-2">
                        <Pause className="size-4" aria-hidden />
                        Pausar
                      </span>
                    </Dropdown.Item>
                  ) : null}
                  {service.status === "PAUSADA" && onReactivate ? (
                    <Dropdown.Item key="reactivate" className="cursor-pointer" onAction={() => onReactivate(service)}>
                      <span className="inline-flex items-center gap-2">
                        <Play className="size-4" aria-hidden />
                        Reactivar
                      </span>
                    </Dropdown.Item>
                  ) : null}
                  {service.status === "BORRADOR" && onPublish ? (
                    <Dropdown.Item key="publish-draft" className="cursor-pointer" onAction={() => onPublish(service)}>
                      <span className="inline-flex items-center gap-2">
                        <Play className="size-4" aria-hidden />
                        Publicar
                      </span>
                    </Dropdown.Item>
                  ) : null}
                  {service.status === "REQUIERE_CAMBIOS" && onPublish ? (
                    <Dropdown.Item key="publish-fix" className="cursor-pointer" onAction={() => onPublish(service)}>
                      <span className="inline-flex items-center gap-2">
                        <Play className="size-4" aria-hidden />
                        Reenviar a revisión
                      </span>
                    </Dropdown.Item>
                  ) : null}
                  {onDelete ? (
                    <Dropdown.Item key="delete" variant="danger" className="cursor-pointer" onAction={() => onDelete(service)}>
                      <span className="inline-flex items-center gap-2">
                        <Trash2 className="size-4" aria-hidden />
                        Eliminar
                      </span>
                    </Dropdown.Item>
                  ) : null}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      {content}
    </motion.article>
  );
}
