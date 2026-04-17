import { api } from "@/lib/api";
import type { ConversationMessage, ConversationThread } from "@/types/conversation.types";

export type ConversationMessageDto = {
  id: string;
  senderUserId: string;
  text: string;
  createdAt: string;
};

export type ConversationThreadDto = {
  id: string;
  threadKind: "service" | "client_request";
  serviceId: string | null;
  clientRequestId: string | null;
  sellerUserId: string;
  buyerUserId: string;
  participant: {
    id: string;
    fullName: string;
    initials: string;
    avatarUrl: string | null;
  };
  serviceTitle: string;
  serviceCoverImageUrl: string | null;
  servicePrice: number | null;
  servicePreviousPrice: number | null;
  serviceCategory: string | null;
  serviceDeliveryTime: string | null;
  unreadCount: number;
  messages: ConversationMessageDto[];
};

function mapMessageDto(m: ConversationMessageDto): ConversationMessage {
  return {
    id: m.id,
    senderUserId: m.senderUserId,
    text: m.text,
    createdAt: m.createdAt,
  };
}

export function mapThreadDto(dto: ConversationThreadDto): ConversationThread {
  return {
    id: dto.id,
    threadKind: dto.threadKind,
    serviceId: dto.serviceId ?? undefined,
    clientRequestId: dto.clientRequestId ?? undefined,
    sellerUserId: dto.sellerUserId,
    buyerUserId: dto.buyerUserId,
    participant: dto.participant,
    serviceTitle: dto.serviceTitle,
    serviceCoverImageUrl: dto.serviceCoverImageUrl ?? null,
    servicePrice: dto.servicePrice ?? null,
    servicePreviousPrice: dto.servicePreviousPrice ?? null,
    serviceCategory: dto.serviceCategory ?? null,
    serviceDeliveryTime: dto.serviceDeliveryTime ?? null,
    unreadCount: dto.unreadCount,
    messages: dto.messages.map(mapMessageDto),
  };
}

export async function fetchConversations(): Promise<ConversationThread[]> {
  const { data } = await api.get<ConversationThreadDto[]>("/conversations");
  return data.map(mapThreadDto);
}

export async function createConversation(body: {
  serviceId?: string;
  clientRequestId?: string;
}): Promise<ConversationThread> {
  const { data } = await api.post<ConversationThreadDto>("/conversations", body);
  return mapThreadDto(data);
}

export async function fetchConversationMessages(
  conversationId: string,
): Promise<ConversationMessage[]> {
  const { data } = await api.get<{ messages: ConversationMessageDto[] }>(
    `/conversations/${conversationId}/messages`,
  );
  return data.messages.map(mapMessageDto);
}

export async function postConversationMessage(
  conversationId: string,
  text: string,
): Promise<ConversationMessage> {
  const { data } = await api.post<ConversationMessageDto>(
    `/conversations/${conversationId}/messages`,
    { text },
  );
  return mapMessageDto(data);
}
