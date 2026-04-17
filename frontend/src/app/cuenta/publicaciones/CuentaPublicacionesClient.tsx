"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@heroui/react/modal";
import { ArrowRight, Layers, LogIn, Megaphone, Sparkles } from "lucide-react";
import { Button } from "@heroui/react/button";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { PublicationPlanUpsellStrip } from "@/components/cuenta/PublicationPlanUpsellStrip";
import { PublicationQuotaOverview } from "@/components/cuenta/PublicationQuotaOverview";
import { ReferralPublicationBoostCta } from "@/components/cuenta/ReferralPublicationBoostCta";
import { useAuthStore } from "@/store/auth.store";
import {
  deleteSkill,
  fetchMyPublications,
  pauseSkill,
  publishSkill,
  reactivateSkill,
} from "@/lib/api/my-services.api";
import type { ServicePublic } from "@/types/service.types";

type PublicationFilter = "all" | ServicePublic["status"];

const FILTERS: Array<{ key: PublicationFilter; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "EN_REVISION", label: "En revisión" },
  { key: "REQUIERE_CAMBIOS", label: "Correcciones pendientes" },
  { key: "ACTIVA", label: "Activas" },
  { key: "PAUSADA", label: "Pausadas" },
];

export function CuentaPublicacionesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<ServicePublic[]>([]);
  const [loading, setLoading] = useState(() => useAuthStore.getState().isAuthenticated);
  const [loadError, setLoadError] = useState(false);
  const [deleting, setDeleting] = useState<ServicePublic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReviewNotice, setShowReviewNotice] = useState(false);
  const [showChangesSavedNotice, setShowChangesSavedNotice] = useState(false);
  const initialFilter = searchParams.get("filtro");
  const [filter, setFilter] = useState<PublicationFilter>(
    initialFilter === "ACTIVA" ||
      initialFilter === "PAUSADA" ||
      initialFilter === "EN_REVISION" ||
      initialFilter === "REQUIERE_CAMBIOS"
      ? initialFilter
      : "all",
  );

  const reload = async () => {
    const list = await fetchMyPublications();
    setItems(list);
  };

  useEffect(() => {
    const toastVal = searchParams.get("toast");
    if (toastVal === "review-submitted") {
      setShowReviewNotice(true);
      setFilter("EN_REVISION");
      const next = new URLSearchParams(searchParams.toString());
      next.delete("toast");
      next.set("filtro", "EN_REVISION");
      const qs = next.toString();
      router.replace(qs ? `/cuenta/publicaciones?${qs}` : "/cuenta/publicaciones");
      return;
    }
    if (toastVal === "changes-saved") {
      setShowChangesSavedNotice(true);
      const next = new URLSearchParams(searchParams.toString());
      next.delete("toast");
      const qs = next.toString();
      router.replace(qs ? `/cuenta/publicaciones?${qs}` : "/cuenta/publicaciones");
      return;
    }

    const nextFilter = searchParams.get("filtro");
    if (nextFilter === "BORRADOR") {
      setFilter("all");
      const next = new URLSearchParams(searchParams.toString());
      next.delete("filtro");
      const qs = next.toString();
      router.replace(qs ? `/cuenta/publicaciones?${qs}` : "/cuenta/publicaciones");
      return;
    }
    if (
      nextFilter === "ACTIVA" ||
      nextFilter === "PAUSADA" ||
      nextFilter === "EN_REVISION" ||
      nextFilter === "REQUIERE_CAMBIOS"
    ) {
      setFilter(nextFilter);
      return;
    }
    setFilter("all");
  }, [searchParams, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setLoadError(false);
      try {
        const list = await fetchMyPublications();
        if (!cancelled) setItems(list);
      } catch {
        if (!cancelled) {
          setItems([]);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const isEmpty = isAuthenticated && !loading && !loadError && items.length === 0;
  const filteredItems = items.filter((item) => (filter === "all" ? true : item.status === filter));

  return (
    <div className="w-full">
      <header className="mb-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Marketplace</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Mis publicaciones
        </h2>
        <p className="mt-2 text-sm text-muted sm:text-[15px]">
          Revisa el estado de cada ficha y edítala o pausala cuando quieras.
        </p>
        {isAuthenticated && !loading && !loadError && user ? (
          <div className="mt-5 max-w-2xl space-y-4">
            <PublicationQuotaOverview user={user} totalListings={items.length} />
            <ReferralPublicationBoostCta user={user} />
          </div>
        ) : null}
      </header>

      {!isAuthenticated ? (
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/[0.08] via-white to-primary-light/[0.06] px-6 py-14 text-center shadow-sm sm:px-12">
          <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary-light/20 blur-3xl" aria-hidden />
          <div className="relative mx-auto flex max-w-lg flex-col items-center gap-5">
            <div className="flex size-20 items-center justify-center rounded-full border border-primary/25 bg-white shadow-md shadow-primary/10">
              <LogIn className="size-9 text-primary" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="space-y-2">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/90 px-3 py-1 text-xs font-medium text-muted shadow-sm backdrop-blur">
                <Sparkles className="size-3.5 text-accent" aria-hidden />
                Acceso a tu vitrina
              </p>
              <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Inicia sesión para ver tus publicaciones
              </h3>
              <p className="text-sm leading-relaxed text-muted sm:text-[15px]">
                Tus servicios publicados se guardan en tu cuenta. Entra con tu correo y revisa o amplía tu oferta cuando quieras.
              </p>
            </div>
            <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white no-underline shadow-md shadow-primary/25 transition hover:opacity-95"
              >
                Iniciar sesión
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/explorar"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-6 text-sm font-semibold text-foreground no-underline transition hover:bg-surface-elevated"
              >
                Explorar servicios
              </Link>
            </div>
          </div>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-border bg-surface-elevated px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No pudimos cargar tus publicaciones</p>
          <p className="mt-1 text-sm text-muted">Revisa tu conexión e inténtalo de nuevo.</p>
          <Button
            variant="primary"
            className="mt-6 rounded-full bg-primary px-6 font-semibold text-white"
            onPress={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[360px] animate-pulse rounded-2xl border border-border bg-surface-elevated" />
          ))}
        </div>
      ) : isEmpty ? (
        <>
          <PublicationPlanUpsellStrip />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/[0.07] via-white to-accent/[0.05] px-6 py-14 text-center shadow-sm sm:px-12">
          <div className="pointer-events-none absolute -right-16 top-0 h-52 w-52 rounded-full bg-primary/12 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-accent/15 blur-3xl" aria-hidden />
          <div className="relative mx-auto flex max-w-lg flex-col items-center gap-5">
            <div className="flex size-20 items-center justify-center rounded-full border border-primary/25 bg-white shadow-md shadow-primary/10">
              <Layers className="size-9 text-primary" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="space-y-2">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/90 px-3 py-1 text-xs font-medium text-muted shadow-sm backdrop-blur">
                <Megaphone className="size-3.5 text-accent" aria-hidden />
                Crea tu primer servicio
              </p>
              <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Aún no tienes publicaciones
              </h3>
              <p className="text-sm leading-relaxed text-muted sm:text-[15px]">
                Publica una habilidad y empieza a recibir mensajes. La ficha pasa por revisión antes de aparecer en Explorar.
              </p>
            </div>
            <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/skills/new"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white no-underline shadow-md shadow-primary/25 transition hover:opacity-95"
              >
                Crear publicación
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/explorar"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-6 text-sm font-semibold text-foreground no-underline transition hover:bg-surface-elevated"
              >
                Ver marketplace
              </Link>
            </div>
          </div>
        </div>
        </>
      ) : (
        <>
          <PublicationPlanUpsellStrip />

          <div className="mb-5 flex flex-wrap items-center gap-2">
            {FILTERS.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setFilter(item.key);
                    const next = new URLSearchParams(searchParams.toString());
                    if (item.key === "all") next.delete("filtro");
                    else next.set("filtro", item.key);
                    router.replace(`/cuenta/publicaciones?${next.toString()}`);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-primary text-white"
                      : "border border-border bg-white text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {showReviewNotice && filter === "EN_REVISION" ? (
            <div
              role="status"
              className="mb-4 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-medium leading-snug text-primary"
            >
              Tu ficha quedó <strong className="font-semibold">en revisión</strong>. Te avisaremos cuando esté aprobada
              o si hace falta algún ajuste. La verás justo debajo en esta misma vista.
            </div>
          ) : null}
          {showChangesSavedNotice ? (
            <div
              role="status"
              className="mb-4 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm font-medium leading-snug text-foreground"
            >
              Cambios guardados correctamente.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                hideFavorite
                showActiveStatus
                onEdit={(s) => router.push(`/skills/${s.id}/edit`)}
                onPublish={async (s) => {
                  if (user?.emailVerified === false) {
                    window.alert(
                      "Verifica tu correo para publicar. Revisa la bandeja de entrada o usa «Reenviar correo» en la parte superior de la página.",
                    );
                    return;
                  }
                  await publishSkill(s.id);
                  await reload();
                }}
                onPause={async (s) => {
                  await pauseSkill(s.id);
                  await reload();
                }}
                onReactivate={async (s) => {
                  if (user?.emailVerified === false) {
                    window.alert(
                      "Verifica tu correo para reactivar la publicación. Revisa el correo que te enviamos o usa «Reenviar correo» arriba.",
                    );
                    return;
                  }
                  await reactivateSkill(s.id);
                  await reload();
                }}
                onDelete={(s) => setDeleting(s)}
              />
            ))}
          </div>

          <Modal isOpen={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
            <Modal.Trigger className="sr-only" aria-label="Abrir confirmar eliminación">
              Abrir
            </Modal.Trigger>
            <Modal.Backdrop isDismissable className="bg-primary-dark/45 backdrop-blur-[2px]">
              <Modal.Container placement="center" size="lg">
                <Modal.Dialog className="rounded-2xl border border-border bg-surface p-0 shadow-xl">
                  <Modal.Header className="border-b border-border px-5 py-4">
                    <Modal.Heading className="text-lg font-bold text-foreground">
                      ¿Eliminar esta habilidad?
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body className="space-y-3 px-5 py-4">
                    <p className="text-sm text-muted">
                      Se perderán todos los datos. Esta acción no se puede deshacer.
                    </p>
                  </Modal.Body>
                  <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
                    <Button
                      variant="outline"
                      className="rounded-full border-border px-5"
                      onPress={() => setDeleting(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="danger"
                      className="rounded-full bg-accent-red px-5 text-white hover:opacity-95"
                      isDisabled={!deleting || isDeleting}
                      onPress={async () => {
                        if (!deleting) return;
                        setIsDeleting(true);
                        try {
                          await deleteSkill(deleting.id);
                          setDeleting(null);
                          await reload();
                        } finally {
                          setIsDeleting(false);
                        }
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        </>
      )}
    </div>
  );
}

