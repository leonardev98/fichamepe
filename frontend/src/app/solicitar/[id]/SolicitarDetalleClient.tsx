"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Briefcase, Clock3, MessageCircle, Users } from "lucide-react";
import { ReportContentModal } from "@/components/moderation/ReportContentModal";
import { Button } from "@heroui/react/button";
import { TextArea } from "@heroui/react/textarea";
import { useAuthModals } from "@/components/auth/auth-modals-context";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { parseApiErrorMessage } from "@/lib/api/auth.api";
import {
  applyToClientRequest,
  fetchClientRequestComments,
  fetchPublicClientRequest,
  postClientRequestComment,
} from "@/lib/api/client-requests.api";
import { createConversation } from "@/lib/api/conversations.api";
import { formatRelativePublishLabel } from "@/lib/format-relative-es";
import { useAuthStore } from "@/store/auth.store";
import type {
  ClientRequestCommentPublic,
  ClientRequestDetailPublic,
} from "@/types/client-request.types";

type SolicitarDetalleClientProps = {
  id: string;
  initialDetail: ClientRequestDetailPublic;
};

export function SolicitarDetalleClient({
  id,
  initialDetail,
}: SolicitarDetalleClientProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { openLogin } = useAuthModals();
  const [detail, setDetail] = useState<ClientRequestDetailPublic | null>(initialDetail);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comments, setComments] = useState<ClientRequestCommentPublic[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [applyBusy, setApplyBusy] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [reportModal, setReportModal] = useState<
    null | { kind: "request" } | { kind: "comment"; commentId: string }
  >(null);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const load = useCallback(async () => {
    if (!id) return;
    setLoadError(null);
    try {
      const [d, c] = await Promise.all([
        fetchPublicClientRequest(id),
        fetchClientRequestComments(id, { limit: 50, offset: 0 }),
      ]);
      setDetail(d);
      setComments(c.comments);
    } catch {
      setDetail(null);
      setLoadError("No encontramos esta solicitud o aún no está publicada.");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePostular = async () => {
    setActionMsg(null);
    if (!isAuthenticated) {
      openLogin({ afterLoginHref: `/solicitar/${id}` });
      return;
    }
    setApplyBusy(true);
    try {
      const res = await applyToClientRequest(id);
      if (detail) {
        setDetail({ ...detail, applicantsCount: res.applicantsCount });
      }
      setActionMsg("Postulación registrada.");
    } catch (e: unknown) {
      setActionMsg(parseApiErrorMessage(e, "No pudimos registrar tu postulación."));
    } finally {
      setApplyBusy(false);
    }
  };

  const handleConversar = async () => {
    setActionMsg(null);
    if (!isAuthenticated) {
      openLogin({ afterLoginHref: `/solicitar/${id}` });
      return;
    }
    setChatBusy(true);
    try {
      const thread = await createConversation({ clientRequestId: id });
      router.push(
        `/conversaciones?vista=consultas&open=${encodeURIComponent(thread.id)}`,
      );
    } catch (e: unknown) {
      setActionMsg(parseApiErrorMessage(e, "No pudimos abrir la conversación."));
    } finally {
      setChatBusy(false);
    }
  };

  const sendComment = async () => {
    if (!isAuthenticated) {
      openLogin({ afterLoginHref: `/solicitar/${id}` });
      return;
    }
    const t = commentBody.trim();
    if (!t) return;
    setCommentError(null);
    setCommentBusy(true);
    try {
      const created = await postClientRequestComment(id, t);
      setComments((prev) => [created, ...prev]);
      setCommentBody("");
    } catch (e: unknown) {
      setCommentError(parseApiErrorMessage(e, "No pudimos publicar el comentario."));
    } finally {
      setCommentBusy(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link href="/solicitar" className="text-sm font-medium text-primary hover:underline">
          ← Volver a solicitudes
        </Link>

        {loadError || !detail ? (
          <div className="mt-8 rounded-2xl border border-border bg-white px-6 py-10 text-center">
            <p className="text-sm text-muted">{loadError ?? "Cargando…"}</p>
          </div>
        ) : (
          <>
            <header className="mt-6 rounded-2xl border border-border bg-white p-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {detail.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="size-4 shrink-0" aria-hidden />
                  {detail.budget}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 shrink-0" aria-hidden />
                  {detail.applicantsCount}{" "}
                  {detail.applicantsCount === 1 ? "postulante" : "postulantes"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4 shrink-0" aria-hidden />
                  {formatRelativePublishLabel(detail.createdAt)}
                </span>
              </div>
              {detail.detail ? (
                <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-[15px]">
                  {detail.detail}
                </p>
              ) : null}
              {actionMsg ? (
                <p className="mt-4 text-sm text-primary" role="status">
                  {actionMsg}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="rounded-full bg-primary font-semibold text-white"
                  onPress={() => void handlePostular()}
                  isDisabled={applyBusy || chatBusy}
                  isPending={applyBusy}
                >
                  Postular
                </Button>
                <Button
                  variant="outline"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-primary/30 text-primary"
                  onPress={() => void handleConversar()}
                  isDisabled={applyBusy || chatBusy}
                  isPending={chatBusy}
                >
                  <MessageCircle className="size-4 shrink-0" aria-hidden />
                  Conversar con el solicitante
                </Button>
                {currentUserId && currentUserId !== detail.ownerUserId ? (
                  <Button
                    variant="outline"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-accent-red/35 text-accent-red"
                    onPress={() => {
                      if (!isAuthenticated) {
                        openLogin({ afterLoginHref: `/solicitar/${id}` });
                        return;
                      }
                      setReportModal({ kind: "request" });
                    }}
                  >
                    <AlertTriangle className="size-4 shrink-0" aria-hidden />
                    Reportar solicitud
                  </Button>
                ) : null}
              </div>
            </header>

            <section className="mt-8 rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-bold text-foreground">Comentarios</h2>
              <p className="mt-1 text-sm text-muted">
                Todos pueden leer. Solo usuarios registrados pueden escribir.
              </p>
              {isAuthenticated ? (
                <div className="mt-4 space-y-2">
                  <p className="mb-1 text-xs font-semibold text-muted">Nuevo comentario</p>
                  <TextArea
                    placeholder="Escribe un comentario público…"
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    rows={3}
                    className="w-full min-h-[72px]"
                  />
                  {commentError ? (
                    <p className="text-sm text-accent-red">{commentError}</p>
                  ) : null}
                  <Button
                    className="rounded-full bg-primary font-semibold text-white"
                    onPress={() => void sendComment()}
                    isDisabled={commentBusy || !commentBody.trim()}
                    isPending={commentBusy}
                  >
                    Publicar comentario
                  </Button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline"
                    onClick={() => openLogin({ afterLoginHref: `/solicitar/${id}` })}
                  >
                    Inicia sesión
                  </button>{" "}
                  para comentar.
                </p>
              )}
              <ul className="mt-6 space-y-4 border-t border-border pt-6">
                {comments.length === 0 ? (
                  <li className="text-sm text-muted">Aún no hay comentarios.</li>
                ) : (
                  comments.map((c) => (
                    <li key={c.id} className="rounded-xl border border-border/80 bg-surface-elevated/40 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{c.author.displayName}</span>
                          <span>·</span>
                          <time dateTime={c.createdAt}>
                            {new Date(c.createdAt).toLocaleString("es-PE", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </time>
                        </div>
                        {currentUserId && currentUserId !== c.author.id ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted transition hover:bg-accent-red/10 hover:text-accent-red"
                            onClick={() => {
                              if (!isAuthenticated) {
                                openLogin({ afterLoginHref: `/solicitar/${id}` });
                                return;
                              }
                              setReportModal({ kind: "comment", commentId: c.id });
                            }}
                          >
                            <AlertTriangle className="size-3" aria-hidden />
                            Reportar
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{c.body}</p>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </>
        )}
      </main>
      <Footer />

      {reportModal ? (
        <ReportContentModal
          isOpen
          onClose={() => setReportModal(null)}
          targetType={
            reportModal.kind === "request" ? "client_request" : "client_request_comment"
          }
          targetId={reportModal.kind === "request" ? id : reportModal.commentId}
          title={reportModal.kind === "request" ? "Reportar solicitud" : "Reportar comentario"}
          subtitle={
            reportModal.kind === "request"
              ? "Indica el problema con esta solicitud pública."
              : "Describe por qué este comentario debería revisarse."
          }
        />
      ) : null}
    </div>
  );
}
