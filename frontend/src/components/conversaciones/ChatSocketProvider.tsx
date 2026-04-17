"use client";

import { useEffect } from "react";
import {
  connectChatSocket,
  disconnectChatSocket,
  getChatSocket,
  reconnectChatSocket,
  type MessageNewPayload,
  type NotificationNewPayload,
} from "@/lib/chat/chatSocket";
import { useAuthStore } from "@/store/auth.store";
import { useConversationsStore } from "@/stores/conversationsStore";
import { useNotificationsStore } from "@/stores/notificationsStore";

export function ChatSocketProvider() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const dockConversationId = useConversationsStore((s) => s.dockConversationId);
  const activeConversationId = useConversationsStore((s) => s.activeConversationId);
  const roomId = dockConversationId ?? activeConversationId;

  useEffect(() => {
    if (!accessToken || !isAuthenticated) {
      disconnectChatSocket();
      return;
    }
    const sk = reconnectChatSocket(accessToken);
    const onNew = (payload: MessageNewPayload) => {
      useConversationsStore.getState().ingestRemoteMessage(payload.conversationId, {
        id: payload.id,
        senderUserId: payload.senderUserId,
        text: payload.text,
        createdAt: payload.createdAt,
      });
    };
    const onNotificationNew = (payload: NotificationNewPayload) => {
      useNotificationsStore.getState().applySocketNew(payload);
    };
    sk.on("message:new", onNew);
    sk.on("notification:new", onNotificationNew);
    return () => {
      sk.off("message:new", onNew);
      sk.off("notification:new", onNotificationNew);
      disconnectChatSocket();
    };
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    if (!accessToken || !isAuthenticated || !roomId) return;
    const sk = getChatSocket() ?? connectChatSocket(accessToken);

    const join = () => {
      sk.emit("joinConversation", { conversationId: roomId });
    };

    if (sk.connected) join();
    else sk.once("connect", join);

    return () => {
      sk.off("connect", join);
      if (sk.connected) {
        sk.emit("leaveConversation", { conversationId: roomId });
      }
    };
  }, [roomId, accessToken, isAuthenticated]);

  return null;
}
