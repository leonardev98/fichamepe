export type ConversationMessage = {
  id: string;
  senderUserId: string;
  text: string;
  createdAt: string;
};

export type ConversationParticipant = {
  id: string;
  fullName: string;
  initials: string;
  avatarUrl?: string | null;
};

export type ConversationThreadKind = "service" | "client_request";

export type ConversationThread = {
  id: string;
  threadKind: ConversationThreadKind;
  serviceId?: string | null;
  clientRequestId?: string | null;
  /** Dueño del servicio (publicador). */
  sellerUserId?: string;
  /** Quien consulta o contrata (comprador). */
  buyerUserId?: string;
  /** Solo demo: perspectiva a mostrar si el usuario real no coincide con buyer/seller. */
  demoDefaultPerspective?: "buyer" | "seller";
  participant: ConversationParticipant;
  serviceTitle: string;
  /** Portada del anuncio (miniatura en listas). */
  serviceCoverImageUrl?: string | null;
  /** Datos de referencia del anuncio (snapshot al abrir el chat). */
  servicePrice?: number | null;
  servicePreviousPrice?: number | null;
  serviceCategory?: string | null;
  serviceDeliveryTime?: string | null;
  unreadCount: number;
  messages: ConversationMessage[];
};
