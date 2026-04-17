"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageSquareWarning } from "lucide-react";
import { Button } from "@heroui/react/button";
import { Modal } from "@heroui/react/modal";
import { SKILL_CATEGORIES } from "@/components/skills/skill-wizard.constants";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import {
  approveAdminClientRequest,
  fetchAdminClientRequestReviewQueue,
  requestAdminClientRequestChanges,
} from "@/lib/api/admin-client-requests.api";
import {
  approveAdminService,
  fetchAdminReviewQueue,
  requestAdminServiceChanges,
} from "@/lib/api/admin-services.api";
import {
  applyAdminModerationReport,
  dismissAdminModerationReport,
  fetchAdminModerationReports,
} from "@/lib/api/moderation-reports.api";
import { parseApiErrorMessage } from "@/lib/api/auth.api";
import { moderationReasonLabel } from "@/lib/moderation-reason-options";
import { isActivePromo } from "@/lib/service-promo";
import type { AdminClientRequestQueueItem } from "@/types/client-request.types";
import type { AdminModerationReportItem, ModerationTargetType } from "@/types/moderation.types";
import type { ServicePublic, ServiceStatus } from "@/types/service.types";

type AdminQueueTab = "services" | "client-requests" | "reports";

type RejectingState =
  | null
  | { kind: "service"; item: ServicePublic }
  | { kind: "client-request"; item: AdminClientRequestQueueItem };

const REPORT_TARGET_LABEL: Record<ModerationTargetType, string> = {
  service: "Publicación",
  client_request: "Solicitud",
  client_request_comment: "Comentario",
  user: "Usuario",
};

function reportPublicHref(r: AdminModerationReportItem): string | null {
  switch (r.targetType) {
    case "service":
      return `/servicios/${r.targetId}`;
    case "client_request":
      return `/solicitar/${r.targetId}`;
    case "client_request_comment":
      return r.parentClientRequestId ? `/solicitar/${r.parentClientRequestId}` : null;
    case "user":
      return r.subjectProfileId ? `/perfil/${r.subjectProfileId}` : null;
    default:
      return null;
  }
}

function adminStatusPill(status: ServiceStatus): { label: string; className: string } {
  switch (status) {
    case "EN_REVISION":
      return {
        label: "En revisión",
        className: "bg-primary/12 text-primary ring-1 ring-primary/30",
      };
    case "REQUIERE_CAMBIOS":
      return {
        label: "Requiere cambios",
        className: "bg-accent-red/10 text-accent-red ring-1 ring-accent-red/25",
      };
    case "ACTIVA":
      return {
        label: "Activa",
        className: "bg-success/10 text-success ring-1 ring-success/25",
      };
    case "PAUSADA":
      return {
        label: "Pausada",
        className: "bg-muted/30 text-muted ring-1 ring-border",
      };
    default:
      return {
        label: "Borrador",
        className: "bg-surface-elevated text-muted ring-1 ring-border",
      };
  }
}

export function DashboardAdminClient() {
  const [queueTab, setQueueTab] = useState<AdminQueueTab>("services");

  const [serviceItems, setServiceItems] = useState<ServicePublic[]>([]);
  const [serviceSelectedId, setServiceSelectedId] = useState<string | null>(null);

  const [requestItems, setRequestItems] = useState<AdminClientRequestQueueItem[]>([]);
  const [requestSelectedId, setRequestSelectedId] = useState<string | null>(null);

  const [reportItems, setReportItems] = useState<AdminModerationReportItem[]>([]);
  const [reportSelectedId, setReportSelectedId] = useState<string | null>(null);
  const [reportTypeFilter, setReportTypeFilter] = useState<ModerationTargetType | "all">("all");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<RejectingState>(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => serviceItems.find((item) => item.id === serviceSelectedId) ?? null,
    [serviceItems, serviceSelectedId],
  );

  const selectedRequest = useMemo(
    () => requestItems.find((item) => item.id === requestSelectedId) ?? null,
    [requestItems, requestSelectedId],
  );

  const selectedReport = useMemo(
    () => reportItems.find((item) => item.id === reportSelectedId) ?? null,
    [reportItems, reportSelectedId],
  );

  const reload = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (queueTab === "services") {
        const queue = await fetchAdminReviewQueue();
        setServiceItems(queue);
        if (!serviceSelectedId && queue.length > 0) {
          setServiceSelectedId(queue[0]?.id ?? null);
        }
        if (serviceSelectedId && !queue.some((item) => item.id === serviceSelectedId)) {
          setServiceSelectedId(queue[0]?.id ?? null);
        }
      } else if (queueTab === "client-requests") {
        const { requests } = await fetchAdminClientRequestReviewQueue();
        setRequestItems(requests);
        if (!requestSelectedId && requests.length > 0) {
          setRequestSelectedId(requests[0]?.id ?? null);
        }
        if (requestSelectedId && !requests.some((item) => item.id === requestSelectedId)) {
          setRequestSelectedId(requests[0]?.id ?? null);
        }
      } else {
        const data = await fetchAdminModerationReports({
          reviewStatus: "pending",
          targetType: reportTypeFilter === "all" ? undefined : reportTypeFilter,
          limit: 100,
          offset: 0,
        });
        setReportItems(data.reports);
        if (!reportSelectedId && data.reports.length > 0) {
          setReportSelectedId(data.reports[0]?.id ?? null);
        }
        if (
          reportSelectedId &&
          !data.reports.some((item) => item.id === reportSelectedId)
        ) {
          setReportSelectedId(data.reports[0]?.id ?? null);
        }
      }
    } catch {
      if (queueTab === "services") {
        setServiceItems([]);
        setLoadError("No pudimos cargar la cola de publicaciones.");
      } else if (queueTab === "client-requests") {
        setRequestItems([]);
        setLoadError("No pudimos cargar la cola de solicitudes.");
      } else {
        setReportItems([]);
        setLoadError("No pudimos cargar los reportes.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueTab, reportTypeFilter]);

  const approveService = async (service: ServicePublic) => {
    setBusyId(service.id);
    try {
      await approveAdminService(service.id);
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const approveRequest = async (req: AdminClientRequestQueueItem) => {
    setBusyId(req.id);
    try {
      await approveAdminClientRequest(req.id);
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const rejectSubmit = async () => {
    if (!rejecting) return;
    const feedback = comment.trim();
    if (feedback.length < 10) {
      setCommentError("Escribe al menos 10 caracteres para guiar la corrección.");
      return;
    }
    setCommentError(null);
    setBusyId(rejecting.item.id);
    try {
      if (rejecting.kind === "service") {
        await requestAdminServiceChanges(rejecting.item.id, feedback);
      } else {
        await requestAdminClientRequestChanges(rejecting.item.id, feedback);
      }
      setRejecting(null);
      setComment("");
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const dismissReport = async (r: AdminModerationReportItem) => {
    setBusyId(r.id);
    try {
      await dismissAdminModerationReport(r.id);
      await reload();
    } catch (e: unknown) {
      window.alert(parseApiErrorMessage(e, "No se pudo descartar el reporte."));
    } finally {
      setBusyId(null);
    }
  };

  const applyReport = async (r: AdminModerationReportItem) => {
    setBusyId(r.id);
    try {
      await applyAdminModerationReport(r.id);
      await reload();
    } catch (e: unknown) {
      window.alert(parseApiErrorMessage(e, "No se pudo aplicar la moderación."));
    } finally {
      setBusyId(null);
    }
  };

  const queueTabClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      active ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-primary/5 hover:text-foreground"
    }`;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Administración</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {queueTab === "services"
            ? "Revisión de publicaciones"
            : queueTab === "client-requests"
              ? "Revisión de solicitudes"
              : "Reportes de usuarios"}
        </h1>
        <p className="text-sm text-muted">
          {queueTab === "services"
            ? "Aprueba publicaciones listas o devuelve con observaciones claras para mejorar su calidad."
            : queueTab === "client-requests"
              ? "Aprueba solicitudes de trabajo para publicarlas o devuélvelas con feedback al solicitante."
              : "Revisa denuncias: descarta si no aplica o aplica moderación para ocultar el contenido o desactivar la cuenta."}
        </p>
        <div
          className="mt-3 inline-flex flex-wrap gap-1 rounded-full border border-border bg-white p-1"
          role="tablist"
          aria-label="Cola de moderación"
        >
          <button
            type="button"
            role="tab"
            aria-selected={queueTab === "services"}
            className={queueTabClass(queueTab === "services")}
            onClick={() => {
              setQueueTab("services");
              setRejecting(null);
              setComment("");
              setCommentError(null);
            }}
          >
            Publicaciones
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={queueTab === "client-requests"}
            className={queueTabClass(queueTab === "client-requests")}
            onClick={() => {
              setQueueTab("client-requests");
              setRejecting(null);
              setComment("");
              setCommentError(null);
            }}
          >
            Solicitudes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={queueTab === "reports"}
            className={queueTabClass(queueTab === "reports")}
            onClick={() => {
              setQueueTab("reports");
              setRejecting(null);
              setComment("");
              setCommentError(null);
            }}
          >
            Reportes
          </button>
        </div>
        {queueTab === "reports" ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted">Filtrar tipo:</span>
            <select
              value={reportTypeFilter}
              onChange={(e) =>
                setReportTypeFilter(e.target.value as ModerationTargetType | "all")
              }
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              <option value="all">Todos</option>
              <option value="service">Publicación</option>
              <option value="client_request">Solicitud</option>
              <option value="client_request_comment">Comentario</option>
              <option value="user">Usuario</option>
            </select>
          </div>
        ) : null}
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-border bg-surface-elevated px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">{loadError}</p>
          <Button
            variant="primary"
            className="mt-5 rounded-full bg-primary px-6 text-white"
            onPress={() => void reload()}
          >
            Reintentar
          </Button>
        </div>
      ) : null}

      {!loadError && queueTab === "services" ? (
        <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-border bg-white p-3">
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-sm font-semibold text-foreground">Pendientes</p>
              <p className="text-xs font-semibold text-muted">{serviceItems.length}</p>
            </div>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-16 animate-pulse rounded-xl bg-surface-elevated" />
                ))}
              </div>
            ) : serviceItems.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface-elevated px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No hay publicaciones en revisión</p>
              </div>
            ) : (
              <div className="space-y-2">
                {serviceItems.map((item) => {
                  const active = item.id === serviceSelectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setServiceSelectedId(item.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                        active
                          ? "border-primary/35 bg-primary/10"
                          : "border-border bg-white hover:border-primary/25 hover:bg-primary/[0.04]"
                      }`}
                    >
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="line-clamp-1 text-xs text-muted">
                        {item.profile?.displayName ?? "Sin perfil"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex min-h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            {!selectedService ? (
              <div className="flex min-h-[300px] flex-1 items-center justify-center px-6 text-sm text-muted">
                Selecciona una publicación para revisar sus detalles.
              </div>
            ) : (
              <>
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-surface-elevated">
                  {selectedService.coverImageUrl ? (
                    <Image
                      src={selectedService.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, min(900px, 65vw)"
                      priority
                    />
                  ) : (
                    <div className="flex h-full min-h-[160px] w-full flex-col items-center justify-center gap-2 px-6 text-center">
                      <span className="text-sm font-medium text-muted">Sin imagen de portada</span>
                      <span className="max-w-sm text-xs text-muted/80">
                        Pide una portada clara si el servicio lo requiere para evaluar la publicación.
                      </span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
                  {isActivePromo(selectedService) ? (
                    <div className="absolute bottom-3 right-3 z-[1]">
                      <CountdownTimer endsAt={selectedService.flashDealEndsAt} overlay />
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-5 p-5 pb-4 lg:pb-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Publicación en revisión
                    </p>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h2 className="max-w-[min(100%,52rem)] text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {selectedService.title}
                      </h2>
                      {(() => {
                        const pill = adminStatusPill(selectedService.status);
                        return (
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${pill.className}`}
                          >
                            {pill.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                      {selectedService.profile?.avatarUrl ? (
                        <span className="relative size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
                          <Image
                            src={selectedService.profile.avatarUrl}
                            alt=""
                            width={36}
                            height={36}
                            className="size-full object-cover"
                          />
                        </span>
                      ) : null}
                      <span>
                        <span className="font-medium text-foreground/80">Autor:</span>{" "}
                        {selectedService.profile?.displayName ?? "Sin nombre"}
                        <span className="mx-1.5 text-border">·</span>
                        <span className="font-medium text-foreground/80">Enviada:</span>{" "}
                        {selectedService.submittedAt
                          ? new Date(selectedService.submittedAt).toLocaleString("es-PE")
                          : "sin fecha"}
                      </span>
                    </div>
                  </div>

                  {selectedService.moderationComment ? (
                    <div className="flex gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                      <MessageSquareWarning
                        className="mt-0.5 size-5 shrink-0 text-accent"
                        aria-hidden
                      />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                          Comentario previo
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                          {selectedService.moderationComment}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Detalle del servicio
                    </p>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/80 bg-surface-elevated/60 px-3 py-2.5">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
                          Categoría
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-foreground">
                          {SKILL_CATEGORIES.find((c) => c.id === selectedService.category)?.label ??
                            selectedService.category}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-border/80 bg-surface-elevated/60 px-3 py-2.5">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
                          Modalidad
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-foreground">
                          {selectedService.deliveryMode}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-border/80 bg-surface-elevated/60 px-3 py-2.5">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
                          Plazo de entrega
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-foreground">
                          {selectedService.deliveryTime}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-border/80 bg-surface-elevated/60 px-3 py-2.5">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
                          Revisiones incluidas
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-foreground">
                          {selectedService.revisionsIncluded}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Descripción
                    </p>
                    <div className="max-h-56 overflow-y-auto rounded-xl border border-border bg-surface-elevated/50 px-4 py-3 text-sm leading-relaxed text-foreground/90 shadow-inner">
                      {selectedService.description}
                    </div>
                  </div>

                  {selectedService.tags.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                        Etiquetas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedService.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-border bg-surface-elevated/40 px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Precio
                    </p>
                    {isActivePromo(selectedService) && selectedService.flashDealEndsAt ? (
                      <div className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted">
                        <span>
                          Oferta vigente hasta{" "}
                          <span className="font-medium text-foreground">
                            {new Date(selectedService.flashDealEndsAt).toLocaleString("es-PE")}
                          </span>
                        </span>
                        <span aria-hidden className="text-border">
                          ·
                        </span>
                        <CountdownTimer endsAt={selectedService.flashDealEndsAt} />
                      </div>
                    ) : null}
                    <PriceDisplay
                      variant="card"
                      price={selectedService.price}
                      previousPrice={selectedService.previousPrice}
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 mt-auto flex flex-wrap justify-end gap-2 border-t border-border bg-white/95 px-5 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm supports-[backdrop-filter]:bg-white/85">
                  <Button
                    variant="outline"
                    className="rounded-full border-accent-red/40 text-accent-red"
                    isDisabled={busyId === selectedService.id}
                    onPress={() => {
                      setRejecting({ kind: "service", item: selectedService });
                      setComment(selectedService.moderationComment ?? "");
                      setCommentError(null);
                    }}
                  >
                    Solicitar cambios
                  </Button>
                  <Button
                    variant="primary"
                    className="rounded-full bg-primary px-6 text-white"
                    isDisabled={busyId === selectedService.id}
                    onPress={() => void approveService(selectedService)}
                  >
                    Aprobar publicación
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}

      {!loadError && queueTab === "client-requests" ? (
        <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-border bg-white p-3">
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-sm font-semibold text-foreground">Pendientes</p>
              <p className="text-xs font-semibold text-muted">{requestItems.length}</p>
            </div>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-16 animate-pulse rounded-xl bg-surface-elevated" />
                ))}
              </div>
            ) : requestItems.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface-elevated px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No hay solicitudes en revisión</p>
              </div>
            ) : (
              <div className="space-y-2">
                {requestItems.map((item) => {
                  const active = item.id === requestSelectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRequestSelectedId(item.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                        active
                          ? "border-primary/35 bg-primary/10"
                          : "border-border bg-white hover:border-primary/25 hover:bg-primary/[0.04]"
                      }`}
                    >
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="line-clamp-1 text-xs text-muted">
                        {item.budget}
                        {item.submittedAt
                          ? ` · ${new Date(item.submittedAt).toLocaleDateString("es-PE")}`
                          : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex min-h-[min(70vh,520px)] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            {!selectedRequest ? (
              <div className="flex min-h-[300px] flex-1 items-center justify-center px-6 text-sm text-muted">
                Selecciona una solicitud para revisar sus detalles.
              </div>
            ) : (
              <>
                <div className="flex flex-1 flex-col gap-5 p-5 pb-4 lg:pb-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Solicitud en revisión
                    </p>
                    <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {selectedRequest.title}
                    </h2>
                    <p className="text-sm text-muted">
                      <span className="font-medium text-foreground/80">Presupuesto:</span>{" "}
                      {selectedRequest.budget}
                      <span className="mx-1.5 text-border">·</span>
                      <span className="font-medium text-foreground/80">Usuario:</span>{" "}
                      <span className="font-mono text-xs">{selectedRequest.userId}</span>
                    </p>
                    <p className="text-sm text-muted">
                      <span className="font-medium text-foreground/80">Enviada:</span>{" "}
                      {selectedRequest.submittedAt
                        ? new Date(selectedRequest.submittedAt).toLocaleString("es-PE")
                        : "sin fecha"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Detalle
                    </p>
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-surface-elevated/50 px-4 py-3 text-sm leading-relaxed text-foreground/90 shadow-inner">
                      {selectedRequest.detail?.trim() ? selectedRequest.detail : "Sin descripción."}
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 mt-auto flex flex-wrap justify-end gap-2 border-t border-border bg-white/95 px-5 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm supports-[backdrop-filter]:bg-white/85">
                  <Button
                    variant="outline"
                    className="rounded-full border-accent-red/40 text-accent-red"
                    isDisabled={busyId === selectedRequest.id}
                    onPress={() => {
                      setRejecting({ kind: "client-request", item: selectedRequest });
                      setComment("");
                      setCommentError(null);
                    }}
                  >
                    Solicitar cambios
                  </Button>
                  <Button
                    variant="primary"
                    className="rounded-full bg-primary px-6 text-white"
                    isDisabled={busyId === selectedRequest.id}
                    onPress={() => void approveRequest(selectedRequest)}
                  >
                    Aprobar solicitud
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}

      {!loadError && queueTab === "reports" ? (
        <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-border bg-white p-3">
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-sm font-semibold text-foreground">Pendientes</p>
              <p className="text-xs font-semibold text-muted">{reportItems.length}</p>
            </div>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-16 animate-pulse rounded-xl bg-surface-elevated" />
                ))}
              </div>
            ) : reportItems.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface-elevated px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No hay reportes pendientes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reportItems.map((item) => {
                  const active = item.id === reportSelectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReportSelectedId(item.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                        active
                          ? "border-primary/35 bg-primary/10"
                          : "border-border bg-white hover:border-primary/25 hover:bg-primary/[0.04]"
                      }`}
                    >
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">
                        {REPORT_TARGET_LABEL[item.targetType]} · {item.targetSummary}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted">
                        {moderationReasonLabel(item.reason)} ·{" "}
                        {new Date(item.createdAt).toLocaleString("es-PE")}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex min-h-[min(70vh,520px)] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            {!selectedReport ? (
              <div className="flex min-h-[300px] flex-1 items-center justify-center px-6 text-sm text-muted">
                Selecciona un reporte para ver el detalle.
              </div>
            ) : (
              <>
                <div className="flex flex-1 flex-col gap-5 p-5 pb-4 lg:pb-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Reporte pendiente
                    </p>
                    <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {REPORT_TARGET_LABEL[selectedReport.targetType]}
                    </h2>
                    <p className="text-sm text-muted">
                      <span className="font-medium text-foreground/80">Objeto:</span>{" "}
                      {selectedReport.targetSummary}
                    </p>
                    <p className="text-sm text-muted">
                      <span className="font-medium text-foreground/80">Motivo:</span>{" "}
                      {moderationReasonLabel(selectedReport.reason)}
                    </p>
                    <p className="text-sm text-muted">
                      <span className="font-medium text-foreground/80">Reporter:</span>{" "}
                      {selectedReport.reporter.fullName?.trim() || selectedReport.reporter.email}
                    </p>
                    {selectedReport.details?.trim() ? (
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                          Detalle del reporte
                        </p>
                        <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-surface-elevated/50 px-4 py-3 text-sm text-foreground/90">
                          {selectedReport.details}
                        </div>
                      </div>
                    ) : null}
                    {reportPublicHref(selectedReport) ? (
                      <Link
                        href={reportPublicHref(selectedReport)!}
                        className="inline-flex text-sm font-semibold text-primary hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver en el sitio público
                      </Link>
                    ) : (
                      <p className="text-xs text-muted">Enlace público no disponible para este tipo.</p>
                    )}
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 mt-auto flex flex-wrap justify-end gap-2 border-t border-border bg-white/95 px-5 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm supports-[backdrop-filter]:bg-white/85">
                  <Button
                    variant="outline"
                    className="rounded-full border-border px-5"
                    isDisabled={busyId === selectedReport.id}
                    onPress={() => void dismissReport(selectedReport)}
                  >
                    Descartar
                  </Button>
                  <Button
                    variant="primary"
                    className="rounded-full bg-primary px-6 text-white"
                    isDisabled={busyId === selectedReport.id}
                    onPress={() => void applyReport(selectedReport)}
                  >
                    Aplicar moderación
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}

      <Modal isOpen={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <Modal.Trigger className="sr-only" aria-label="Abrir correcciones">
          Abrir
        </Modal.Trigger>
        <Modal.Backdrop isDismissable className="bg-primary-dark/45 backdrop-blur-[2px]">
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="rounded-2xl border border-border bg-white p-0 shadow-xl">
              <Modal.Header className="border-b border-border px-5 py-4">
                <Modal.Heading className="text-lg font-bold text-foreground">
                  Solicitar correcciones
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="space-y-3 px-5 py-4">
                <p className="text-sm text-muted">
                  {rejecting?.kind === "client-request"
                    ? "Indica al solicitante qué debe aclarar o ajustar antes de publicar la solicitud."
                    : "Explica al propietario qué debe mejorar para que la publicación pueda aprobarse."}
                </p>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/20"
                  placeholder="Ejemplo: agrega más detalle del entregable, tiempo realista y una portada más clara."
                />
                {commentError ? (
                  <p className="text-xs font-medium text-accent-red">{commentError}</p>
                ) : null}
              </Modal.Body>
              <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
                <Button
                  variant="outline"
                  className="rounded-full border-border px-5"
                  onPress={() => setRejecting(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  className="rounded-full bg-accent-red px-5 text-white hover:opacity-95"
                  isDisabled={!rejecting || busyId === rejecting.item.id}
                  onPress={() => void rejectSubmit()}
                >
                  Enviar observaciones
                </Button>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
