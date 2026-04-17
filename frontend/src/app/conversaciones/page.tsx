"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { ConversationListItem } from "@/components/conversaciones/ConversationListItem";
import { ConversationPerspectiveChip } from "@/components/conversaciones/ConversationPerspectiveChip";
import { ConversationServiceSummaryCard } from "@/components/conversaciones/ConversationServiceSummaryCard";
import { MessageBubble } from "@/components/conversaciones/MessageBubble";
import {
  filterConversationsByPerspective,
  filterConversationsWithoutPerspective,
  getConversationPerspective,
  perspectiveContextLine,
} from "@/components/conversaciones/conversation-utils";
import { useAuthStore } from "@/store/auth.store";
import { useConversationsStore } from "@/stores/conversationsStore";

const OPEN_CONV_PARAM = "open";

type InboxTab = "buyer" | "seller" | "other";

function parseVistaParam(v: string | null): InboxTab | null {
  if (!v) return null;
  const n = v.toLowerCase();
  if (n === "comprador" || n === "consultas" || n === "mis-consultas") return "buyer";
  if (n === "vendedor" || n === "publicaciones" || n === "mis-publicaciones") return "seller";
  if (n === "otros" || n === "sin-clasificar") return "other";
  return null;
}

function vistaQueryFromTab(tab: InboxTab): string {
  if (tab === "buyer") return "consultas";
  if (tab === "seller") return "publicaciones";
  return "sin-clasificar";
}

function tabFromSearchParams(searchParams: URLSearchParams, role: string | undefined): InboxTab {
  const fromUrl = parseVistaParam(searchParams.get("vista"));
  if (fromUrl) return fromUrl;
  if (role === "freelancer") return "seller";
  return "buyer";
}

function ConversacionesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? null;
  const [draft, setDraft] = useState("");
  const [mobileConversationId, setMobileConversationId] = useState<string | null>(null);

  const conversations = useConversationsStore((state) => state.conversations);
  const activeConversationId = useConversationsStore((state) => state.activeConversationId);
  const setActiveConversation = useConversationsStore((state) => state.setActiveConversation);
  const clearActiveConversation = useConversationsStore((state) => state.clearActiveConversation);
  const sendMessage = useConversationsStore((state) => state.sendMessage);

  const tab = useMemo(
    () => tabFromSearchParams(searchParams, user?.role),
    [searchParams, user?.role],
  );

  const openConversationId = searchParams.get(OPEN_CONV_PARAM);

  useEffect(() => {
    if (!openConversationId) return;
    let cancelled = false;
    void (async () => {
      await useConversationsStore.getState().syncFromApi();
      if (cancelled) return;
      useConversationsStore.getState().setActiveConversation(openConversationId);
      setMobileConversationId(openConversationId);
      const next = new URLSearchParams(searchParams.toString());
      next.delete(OPEN_CONV_PARAM);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    })();
    return () => {
      cancelled = true;
    };
  }, [openConversationId, pathname, router, searchParams]);

  const filteredConversations = useMemo(() => {
    if (tab === "buyer") return filterConversationsByPerspective(conversations, "buyer", userId);
    if (tab === "seller") return filterConversationsByPerspective(conversations, "seller", userId);
    return filterConversationsWithoutPerspective(conversations, userId);
  }, [conversations, tab, userId]);

  useEffect(() => {
    if (!activeConversationId) return;
    const stillVisible = filteredConversations.some((c) => c.id === activeConversationId);
    if (!stillVisible) {
      if (filteredConversations[0]) {
        setActiveConversation(filteredConversations[0].id);
      } else {
        clearActiveConversation();
      }
    }
  }, [
    activeConversationId,
    filteredConversations,
    setActiveConversation,
    clearActiveConversation,
  ]);

  const setTabAndUrl = useCallback(
    (next: InboxTab) => {
      const q = vistaQueryFromTab(next);
      router.replace(`${pathname}?vista=${q}`, { scroll: false });
    },
    [pathname, router],
  );

  const desktopConversation = useMemo(
    () => filteredConversations.find((c) => c.id === activeConversationId) ?? null,
    [filteredConversations, activeConversationId],
  );
  const mobileConversation = useMemo(
    () => filteredConversations.find((c) => c.id === mobileConversationId) ?? null,
    [filteredConversations, mobileConversationId],
  );

  const desktopPerspective = useMemo(
    () => (desktopConversation ? getConversationPerspective(desktopConversation, userId) : null),
    [desktopConversation, userId],
  );
  const mobilePerspective = useMemo(
    () => (mobileConversation ? getConversationPerspective(mobileConversation, userId) : null),
    [mobileConversation, userId],
  );

  const subtitle = useMemo(() => {
    if (tab === "buyer")
      return "Conversaciones que abriste al contactar el anuncio de otra persona.";
    if (tab === "seller")
      return "Personas que te escribieron porque les interesa una publicación tuya.";
    return "Conversaciones que aún no podemos clasificar (datos antiguos o incompletos).";
  }, [tab]);

  const tabButtonClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      active ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-primary/5 hover:text-foreground"
    }`;

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const targetConversation = mobileConversation ?? desktopConversation;
    if (!targetConversation) return;
    const cleaned = draft.trim();
    if (!cleaned) return;
    try {
      await sendMessage(targetConversation.id, cleaned);
      setDraft("");
    } catch {
      /* errores de red / 401 ya gestionados por el cliente API */
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">Conversaciones</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div
            className="mt-4 inline-flex flex-wrap gap-1 rounded-full border border-border bg-white p-1"
            role="tablist"
            aria-label="Tipo de conversación"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "buyer"}
              className={tabButtonClass(tab === "buyer")}
              onClick={() => setTabAndUrl("buyer")}
            >
              Mis consultas
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "seller"}
              className={tabButtonClass(tab === "seller")}
              onClick={() => setTabAndUrl("seller")}
            >
              Mis publicaciones
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "other"}
              className={tabButtonClass(tab === "other")}
              onClick={() => setTabAndUrl("other")}
            >
              Sin clasificar
            </button>
          </div>
        </div>

        <section className="hidden min-h-[620px] overflow-hidden rounded-2xl border border-border bg-white md:grid md:grid-cols-[320px_1fr]">
          <aside className="border-r border-border bg-background/50 p-3">
            <div className="space-y-2">
              {filteredConversations.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted">No hay conversaciones en esta vista.</p>
              ) : (
                filteredConversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    perspective={getConversationPerspective(conversation, userId)}
                    isActive={conversation.id === desktopConversation?.id}
                    onClick={() => setActiveConversation(conversation.id)}
                  />
                ))
              )}
            </div>
          </aside>

          <div className="flex min-h-0 flex-col">
            {desktopConversation ? (
              <>
                <header className="space-y-3 border-b border-border px-5 py-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        {desktopConversation.participant.fullName}
                      </h2>
                      <ConversationPerspectiveChip perspective={desktopPerspective} />
                    </div>
                    {perspectiveContextLine(desktopPerspective, desktopConversation) ? (
                      <p className="mt-1 text-[11px] leading-snug text-muted/90">
                        {perspectiveContextLine(desktopPerspective, desktopConversation)}
                      </p>
                    ) : null}
                  </div>
                  <ConversationServiceSummaryCard
                    conversation={desktopConversation}
                    perspective={desktopPerspective}
                  />
                </header>
                <div className="flex-1 space-y-2 overflow-y-auto bg-background px-5 py-4">
                  {desktopConversation.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
                <form onSubmit={submitMessage} className="border-t border-border p-4">
                  <div className="flex items-center gap-2">
                    <input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Escribe tu mensaje y presiona Enter"
                      className="h-11 w-full rounded-full border border-border bg-white px-4 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="submit"
                      className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-white transition hover:opacity-95"
                      aria-label="Enviar mensaje"
                    >
                      <Send className="size-4" aria-hidden />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-sm text-muted">
                Selecciona una conversación para empezar.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 md:hidden">
          {!mobileConversation ? (
            <div className="space-y-2">
              {filteredConversations.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">No hay conversaciones en esta vista.</p>
              ) : (
                filteredConversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    perspective={getConversationPerspective(conversation, userId)}
                    onClick={() => {
                      setActiveConversation(conversation.id);
                      setMobileConversationId(conversation.id);
                    }}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="flex min-h-[70vh] flex-col">
              <div className="mb-3 space-y-3 border-b border-border pb-3">
                <header className="flex items-start gap-2">
                  <button
                    type="button"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition hover:border-primary/40 hover:text-primary"
                    onClick={() => setMobileConversationId(null)}
                    aria-label="Volver a conversaciones"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-foreground">
                        {mobileConversation.participant.fullName}
                      </h2>
                      <ConversationPerspectiveChip perspective={mobilePerspective} />
                    </div>
                    {perspectiveContextLine(mobilePerspective, mobileConversation) ? (
                      <p className="mt-0.5 text-[11px] leading-snug text-muted/90">
                        {perspectiveContextLine(mobilePerspective, mobileConversation)}
                      </p>
                    ) : null}
                  </div>
                </header>
                <ConversationServiceSummaryCard
                  conversation={mobileConversation}
                  perspective={mobilePerspective}
                  compact
                />
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto bg-background px-1 py-2">
                {mobileConversation.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
              <form onSubmit={submitMessage} className="mt-3 border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Escribe un mensaje"
                    className="h-10 w-full rounded-full border border-border bg-white px-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-white transition hover:opacity-95"
                    aria-label="Enviar mensaje"
                  >
                    <Send className="size-4" aria-hidden />
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

export default function ConversacionesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-col bg-background">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
            <p className="text-sm text-muted">Cargando conversaciones…</p>
          </main>
          <Footer />
          <BottomNav />
        </div>
      }
    >
      <ConversacionesContent />
    </Suspense>
  );
}
