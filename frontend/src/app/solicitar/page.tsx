"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Lock,
  LogIn,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Input } from "@heroui/react/input";
import { TextArea } from "@heroui/react/textarea";
import { useAuthModals } from "@/components/auth/auth-modals-context";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { parseApiErrorMessage } from "@/lib/api/auth.api";
import {
  applyToClientRequest,
  createClientRequest,
  fetchOpenClientRequests,
} from "@/lib/api/client-requests.api";
import { formatRelativePublishLabel } from "@/lib/format-relative-es";
import { useAuthStore } from "@/store/auth.store";
import type { ClientRequestPublic } from "@/types/client-request.types";

const STEP_LABELS = ["Título", "Detalle", "Presupuesto", "Revisión"] as const;

export default function SolicitarPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openLogin } = useAuthModals();
  const [requests, setRequests] = useState<ClientRequestPublic[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [budget, setBudget] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyNotice, setApplyNotice] = useState<{
    variant: "success" | "error";
    text: string;
  } | null>(null);

  const progressPct = useMemo(
    () => ((wizardStep + 1) / STEP_LABELS.length) * 100,
    [wizardStep],
  );

  const canGoNext = useMemo(() => {
    if (wizardStep === 0) return title.trim().length >= 5;
    if (wizardStep === 1) return true;
    if (wizardStep === 2) return budget.trim().length >= 1;
    return false;
  }, [wizardStep, title, budget]);

  const loadRequests = useCallback(async () => {
    setListError(null);
    setListLoading(true);
    try {
      const list = await fetchOpenClientRequests(40);
      setRequests(list);
    } catch {
      setListError("No pudimos cargar las solicitudes. Revisa tu conexión e inténtalo de nuevo.");
      setRequests([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests, isAuthenticated]);

  const resetWizard = () => {
    setWizardStep(0);
    setTitle("");
    setDetail("");
    setBudget("");
  };

  const createRequest = async () => {
    if (!isAuthenticated || !title.trim() || !budget.trim()) return;
    setPublishError(null);
    setPublishSuccess(null);
    setPublishing(true);
    try {
      await createClientRequest({
        title: title.trim(),
        detail: detail.trim() || undefined,
        budget: budget.trim(),
      });
      resetWizard();
      setPublishSuccess(
        "Tu solicitud fue enviada a revisión. Cuando el equipo la apruebe, aparecerá en el listado público.",
      );
      await loadRequests();
    } catch (e: unknown) {
      setPublishError(
        parseApiErrorMessage(e, "No pudimos enviar la solicitud. Inténtalo de nuevo."),
      );
    } finally {
      setPublishing(false);
    }
  };

  const handlePostular = async (requestId: string) => {
    setApplyNotice(null);
    if (!isAuthenticated) {
      openLogin({ afterLoginHref: "/solicitar" });
      return;
    }
    setApplyingId(requestId);
    try {
      const res = await applyToClientRequest(requestId);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === res.requestId ? { ...r, applicantsCount: res.applicantsCount } : r,
        ),
      );
      setApplyNotice({
        variant: "success",
        text: "Tu postulación quedó registrada.",
      });
    } catch (e: unknown) {
      setApplyNotice({
        variant: "error",
        text: parseApiErrorMessage(e, "No pudimos registrar tu postulación."),
      });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" aria-hidden />
            Solicitudes específicas
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-foreground">
            Publica lo que necesitas y deja que postulen
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Ideal para chambas bien específicas. Tú pones el brief y el presupuesto,
            freelancers te mandan propuesta.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
          <section className="rounded-2xl border border-border bg-white p-4">
            <h2 className="text-lg font-bold text-foreground">
              Solicitudes abiertas
            </h2>
            {applyNotice ? (
              <p
                className={
                  applyNotice.variant === "success"
                    ? "mt-2 text-sm text-primary"
                    : "mt-2 text-sm text-accent-red"
                }
                role="status"
              >
                {applyNotice.text}
              </p>
            ) : null}
            <div className="mt-4 space-y-3">
              {listLoading ? (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[140px] animate-pulse rounded-xl border border-border bg-surface-elevated"
                    />
                  ))}
                </>
              ) : listError ? (
                <div className="rounded-xl border border-border bg-surface-elevated px-4 py-6 text-center">
                  <p className="text-sm text-foreground">{listError}</p>
                  <Button
                    variant="primary"
                    className="mt-4 rounded-full bg-primary px-5 font-semibold text-white"
                    onPress={() => void loadRequests()}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : requests.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-surface-elevated/40 px-4 py-8 text-center text-sm text-muted">
                  Aún no hay solicitudes aprobadas visibles. Las nuevas pasan por revisión antes de
                  publicarse aquí.
                </p>
              ) : (
                requests.map((request) => (
                  <article key={request.id} className="rounded-xl border border-border p-3">
                    <h3 className="font-semibold text-foreground">
                      <Link
                        href={`/solicitar/${request.id}`}
                        className="text-foreground underline-offset-2 hover:underline"
                      >
                        {request.title}
                      </Link>
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="size-3.5" aria-hidden />
                        Presupuesto: {request.budget}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" aria-hidden />
                        {request.applicantsCount}{" "}
                        {request.applicantsCount === 1 ? "postulante" : "postulantes"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3.5" aria-hidden />
                        {formatRelativePublishLabel(request.createdAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="rounded-full border-primary/30 text-primary"
                        onPress={() => void handlePostular(request.id)}
                        isDisabled={applyingId !== null}
                        isPending={applyingId === request.id}
                      >
                        Postular
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full border-border"
                        onPress={() => router.push(`/solicitar/${request.id}`)}
                      >
                        Ver detalle
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-4">
            <h2 className="text-lg font-bold text-foreground">Crear solicitud</h2>
            <div className="relative mt-4 min-h-[460px]">
              {!isAuthenticated ? (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border border-border/80 bg-gradient-to-br from-primary/[0.07] via-white/95 to-primary-light/[0.06] p-5 shadow-sm sm:p-8"
                  role="region"
                  aria-label="Debes iniciar sesión para publicar una solicitud"
                >
                  <div
                    className="pointer-events-none absolute -right-14 -top-10 h-36 w-36 rounded-full bg-primary/12 blur-3xl"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute -bottom-8 -left-10 h-32 w-32 rounded-full bg-primary-light/18 blur-3xl"
                    aria-hidden
                  />
                  <div className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-5 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-white shadow-md shadow-primary/10 sm:size-[4.5rem]">
                      <Lock className="size-8 text-primary sm:size-9" strokeWidth={1.65} aria-hidden />
                    </div>
                    <div className="space-y-2">
                      <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/90 px-3 py-1 text-xs font-medium text-muted shadow-sm backdrop-blur">
                        <Sparkles className="size-3.5 text-accent" aria-hidden />
                        Acceso requerido
                      </p>
                      <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                        Inicia sesión para publicar tu solicitud
                      </h3>
                      <p className="text-sm leading-relaxed text-muted sm:text-[15px]">
                        Puedes ver las solicitudes aprobadas sin cuenta. Para publicar o postularte,
                        entra con tu correo.
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                      <button
                        type="button"
                        onClick={() => openLogin({ afterLoginHref: "/solicitar" })}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:opacity-95"
                      >
                        <LogIn className="size-4 shrink-0" aria-hidden />
                        Iniciar sesión
                        <ArrowRight className="size-4 shrink-0" aria-hidden />
                      </button>
                      <Link
                        href="/explorar"
                        className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-6 text-sm font-semibold text-foreground no-underline transition hover:bg-surface-elevated"
                      >
                        Explorar servicios
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}
              <div
                className={
                  !isAuthenticated
                    ? "pointer-events-none select-none opacity-[0.38]"
                    : ""
                }
                aria-hidden={!isAuthenticated}
              >
                <Card className="border border-border/80 bg-surface-elevated/30 p-4 shadow-none sm:p-5">
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
                      <span>Paso {wizardStep + 1} de {STEP_LABELS.length}</span>
                      <span className="text-primary">{STEP_LABELS[wizardStep]}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-border/80">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {wizardStep === 0 ? (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground" htmlFor="sol-title">
                        Título de la solicitud
                      </label>
                      <Input
                        id="sol-title"
                        placeholder="Ej: Necesito editor de reels para campaña"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted">Mínimo 5 caracteres.</p>
                    </div>
                  ) : null}

                  {wizardStep === 1 ? (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground" htmlFor="sol-detail">
                        Detalle
                      </label>
                      <TextArea
                        id="sol-detail"
                        placeholder="Describe lo que necesitas, plazos y estilo..."
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                        rows={6}
                        className="w-full min-h-[140px]"
                      />
                      <p className="text-xs text-muted">Opcional pero ayuda a recibir mejores propuestas.</p>
                    </div>
                  ) : null}

                  {wizardStep === 2 ? (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground" htmlFor="sol-budget">
                        Presupuesto
                      </label>
                      <Input
                        id="sol-budget"
                        placeholder="Ej: S/300 - S/500"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  ) : null}

                  {wizardStep === 3 ? (
                    <div className="space-y-3 rounded-xl border border-border bg-white/80 p-4 text-sm">
                      <p className="font-semibold text-foreground">Revisa antes de enviar</p>
                      <dl className="space-y-2 text-muted">
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide">Título</dt>
                          <dd className="text-foreground">{title.trim()}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide">Detalle</dt>
                          <dd className="whitespace-pre-wrap text-foreground">
                            {detail.trim() || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide">Presupuesto</dt>
                          <dd className="text-foreground">{budget.trim()}</dd>
                        </div>
                      </dl>
                      <p className="rounded-lg bg-primary/8 px-3 py-2 text-xs leading-relaxed text-primary">
                        Tu solicitud será revisada por el equipo antes de publicarse. No aparecerá en
                        el listado público hasta ser aprobada.
                      </p>
                    </div>
                  ) : null}

                  {publishSuccess ? (
                    <p className="mt-4 text-sm text-primary" role="status">
                      {publishSuccess}
                    </p>
                  ) : null}
                  {publishError ? (
                    <p className="mt-4 text-sm text-accent-red" role="alert">
                      {publishError}
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      variant="outline"
                      className="rounded-full border-border"
                      onPress={() => {
                        setPublishError(null);
                        setWizardStep((s) => Math.max(0, s - 1));
                      }}
                      isDisabled={wizardStep === 0 || publishing}
                    >
                      <ChevronLeft className="size-4" aria-hidden />
                      Atrás
                    </Button>
                    {wizardStep < 3 ? (
                      <Button
                        className="rounded-full bg-primary font-semibold text-white sm:min-w-[160px]"
                        onPress={() => {
                          setPublishError(null);
                          if (!canGoNext) return;
                          setWizardStep((s) => Math.min(STEP_LABELS.length - 1, s + 1));
                        }}
                        isDisabled={!canGoNext || publishing}
                      >
                        Siguiente
                        <ChevronRight className="size-4" aria-hidden />
                      </Button>
                    ) : (
                      <Button
                        className="rounded-full bg-primary font-semibold text-white sm:min-w-[200px]"
                        onPress={() => void createRequest()}
                        isDisabled={publishing}
                        isPending={publishing}
                      >
                        <Send className="size-4" aria-hidden />
                        Enviar a revisión
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
