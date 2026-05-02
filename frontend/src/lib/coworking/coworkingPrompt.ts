import type { ConversationThread } from "@/types/conversation.types";

const MIN_MESSAGES_FOR_COWORKING_PROMPT = 4;

export function shouldShowCoworkingPrompt(
  conversation: ConversationThread | null | undefined,
  currentUserId: string | null | undefined,
): boolean {
  if (!conversation || !currentUserId) return false;
  if (conversation.messages.length < MIN_MESSAGES_FOR_COWORKING_PROMPT) return false;

  const participantMessageCount = conversation.messages.filter(
    (message) => message.senderUserId === conversation.participant.id,
  ).length;
  const currentUserMessageCount = conversation.messages.filter(
    (message) => message.senderUserId === currentUserId,
  ).length;

  return participantMessageCount > 0 && currentUserMessageCount > 0;
}
