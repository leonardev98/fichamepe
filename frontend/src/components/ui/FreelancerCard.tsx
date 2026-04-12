"use client";

import Link from "next/link";
import { Avatar } from "@heroui/react/avatar";
import { Card } from "@heroui/react/card";
import { buttonVariants } from "@heroui/styles";
import type { Profile } from "@/types/profile.types";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  const stars = Array.from({ length: 5 }, (_, i) => (i < rounded ? "★" : "☆"));

  return (
    <span
      className="text-sm tracking-tight text-accent"
      aria-label={`${rating.toFixed(1)} de 5 estrellas`}
    >
      {stars.join("")}
      <span className="ml-1.5 text-xs font-medium text-muted">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export type FreelancerCardProps = {
  profile: Profile;
};

const MAX_SKILL_BADGES = 3;

export function FreelancerCard({ profile }: FreelancerCardProps) {
  const visible = profile.skills.slice(0, MAX_SKILL_BADGES);
  const rest = profile.skills.length - visible.length;

  return (
    <Card
      variant="secondary"
      className="border border-border bg-surface/90 transition-colors hover:border-primary/40"
    >
      <Card.Header className="flex flex-row items-start gap-4 pb-2">
        <Avatar className="shrink-0" size="lg">
          {profile.avatarUrl ? (
            <Avatar.Image
              src={profile.avatarUrl}
              alt=""
              className="object-cover"
            />
          ) : null}
          <Avatar.Fallback className="bg-violet-600 text-sm font-semibold text-white">
            {initialsFromName(profile.displayName)}
          </Avatar.Fallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <Card.Title className="truncate text-base font-semibold text-foreground">
            {profile.displayName}
          </Card.Title>
          <p className="text-xs text-muted">
            {profile.district ?? "Sin distrito"}
          </p>
          {profile.rating !== undefined ? (
            <StarRating rating={profile.rating} />
          ) : null}
        </div>
      </Card.Header>
      <Card.Content className="space-y-3 pt-0">
        <div className="flex flex-wrap gap-1.5">
          {visible.map((skill) => (
            <span
              key={skill.id}
              className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {skill.name}
            </span>
          ))}
          {rest > 0 ? (
            <span className="rounded-md bg-border px-2 py-0.5 text-xs font-medium text-muted">
              +{rest} más
            </span>
          ) : null}
        </div>
        <p className="text-sm font-semibold text-foreground">
          {profile.hourlyRate != null ? (
            <>
              S/ {profile.hourlyRate}
              <span className="font-normal text-muted"> / hora</span>
            </>
          ) : (
            <span className="text-muted">—</span>
          )}
        </p>
      </Card.Content>
      <Card.Footer className="pt-2">
        <Link
          href={`/perfil/${profile.id}`}
          className={buttonVariants({
            variant: "outline",
            fullWidth: true,
            className:
              "inline-flex justify-center border-primary/50 text-primary hover:bg-primary/10",
          })}
        >
          Ver perfil
        </Link>
      </Card.Footer>
    </Card>
  );
}
