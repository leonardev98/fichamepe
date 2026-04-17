import type { ConversationThread } from "@/types/conversation.types";

/** Rol del usuario autenticado en este hilo respecto al servicio. */
export type ConversationPerspective = "buyer" | "seller";

function sameUserId(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Comprador = consultaste la publicación de otra persona.
 * Vendedor = te escribieron (o gestionas) una conversación sobre tu publicación.
 */
export function getConversationPerspective(
  conversation: ConversationThread,
  userId: string | null | undefined,
): ConversationPerspective | null {
  if (!userId) return null;
  const { sellerUserId, buyerUserId, demoDefaultPerspective } = conversation;

  if (sellerUserId && sameUserId(userId, sellerUserId)) return "seller";
  if (buyerUserId && sameUserId(userId, buyerUserId)) return "buyer";

  /** Hilos antiguos: solo teníamos dueño del servicio; el otro en el chat eres tú como consultor. */
  if (sellerUserId && !buyerUserId && !sameUserId(userId, sellerUserId)) return "buyer";

  if (demoDefaultPerspective) return demoDefaultPerspective;
  return null;
}

export function filterConversationsByPerspective(
  conversations: ConversationThread[],
  perspective: ConversationPerspective,
  userId: string | null | undefined,
): ConversationThread[] {
  return conversations.filter((c) => getConversationPerspective(c, userId) === perspective);
}

export function filterConversationsWithoutPerspective(
  conversations: ConversationThread[],
  userId: string | null | undefined,
): ConversationThread[] {
  return conversations.filter((c) => getConversationPerspective(c, userId) === null);
}

/** Texto corto para chips y pestañas. */
export function perspectiveLabel(p: ConversationPerspective | null): string {
  if (p === "buyer") return "Consulté";
  if (p === "seller") return "Mi publicación";
  return "Chat";
}

/** Una línea que explica el contexto (lista, dock, cabecera). */
export function perspectiveContextLine(
  p: ConversationPerspective | null,
  conversation?: ConversationThread | null,
): string | null {
  if (conversation?.threadKind === "client_request") {
    if (p === "buyer") return "Consultaste esta solicitud de trabajo";
    if (p === "seller") return "Te escribieron por tu solicitud publicada";
    return null;
  }
  if (p === "buyer") return "Consultaste el anuncio de esta persona";
  if (p === "seller") return "Te escribieron por tu publicación";
  return null;
}

export function getLastMessage(conversation: ConversationThread): string {
  return conversation.messages[conversation.messages.length - 1]?.text ?? "";
}

export function getLastMessageDate(conversation: ConversationThread): Date | null {
  const iso = conversation.messages[conversation.messages.length - 1]?.createdAt;
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatRelativeTime(date: Date | null): string {
  if (!date) return "";
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays} d`;
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
  });
}

