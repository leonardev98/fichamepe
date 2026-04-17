import { io, type Socket } from "socket.io-client";

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

let socket: Socket | null = null;

export function getChatSocket(): Socket | null {
  return socket;
}

/** Primera conexión o reconexión suave si el socket ya existe. */
export function connectChatSocket(accessToken: string): Socket {
  if (!baseURL) {
    // eslint-disable-next-line no-console
    console.warn("[chat] NEXT_PUBLIC_API_URL no está definida; no hay socket.");
  }
  if (socket) {
    socket.auth = { token: accessToken };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }
  socket = io(baseURL, {
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    auth: { token: accessToken },
    autoConnect: true,
    withCredentials: true,
  });
  return socket;
}

/** Tras rotar el JWT: nuevo handshake con el token actualizado. */
export function reconnectChatSocket(accessToken: string): Socket {
  if (socket) {
    socket.auth = { token: accessToken };
    socket.disconnect();
    socket.connect();
    return socket;
  }
  return connectChatSocket(accessToken);
}

export function disconnectChatSocket(): void {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}

export type MessageNewPayload = {
  conversationId: string;
  id: string;
  senderUserId: string;
  text: string;
  createdAt: string;
};

export type NotificationNewPayload = {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  unreadCount: number;
};
