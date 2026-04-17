"use client";

import type { ConversationPerspective } from "@/components/conversaciones/conversation-utils";
import {
  formatRelativeTime,
  getLastMessage,
  getLastMessageDate,
  perspectiveLabel,
} from "@/components/conversaciones/conversation-utils";
import { ConversationServiceCover } from "@/components/conversaciones/ConversationServiceCover";
import type { ConversationThread } from "@/types/conversation.types";

type ConversationListItemProps = {
  conversation: ConversationThread;
  perspective?: ConversationPerspective | null;
  isActive?: boolean;
  onClick?: () => void;
};

export function ConversationListItem({
  conversation,
  perspective = null,
  isActive = false,
  onClick,
}: ConversationListItemProps) {
  const preview = getLastMessage(conversation);
  const relative = formatRelativeTime(getLastMessageDate(conversation));

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition ${
        isActive
          ? "border-primary/30 bg-primary/[0.06]"
          : "border-border bg-white hover:border-primary/25 hover:bg-primary/[0.03]"
      }`}
    >
      <div className="flex items-start gap-3">
        <ConversationServiceCover
          coverUrl={conversation.serviceCoverImageUrl}
          serviceTitle={conversation.serviceTitle}
          initialsFallback={conversation.participant.initials}
          perspective={perspective}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
              <p className="truncate text-sm font-semibold text-foreground">
                {conversation.participant.fullName}
              </p>
              {conversation.threadKind === "client_request" ? (
                <span className="shrink-0 rounded-full border border-primary/30 bg-primary/[0.08] px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Solicitud
                </span>
              ) : null}
              {perspective ? (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    perspective === "buyer"
                      ? "border border-primary/25 bg-primary/[0.09] text-primary"
                      : "border border-primary/30 bg-primary/[0.14] text-primary-dark"
                  }`}
                >
                  {perspectiveLabel(perspective)}
                </span>
              ) : null}
            </div>
            <span className="shrink-0 text-[11px] text-muted">{relative}</span>
          </div>
          <p className="mt-1 truncate text-[12px] font-semibold leading-snug text-foreground/90">
            {conversation.serviceTitle}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] font-normal leading-snug text-muted">
            {preview}
          </p>
        </div>
      </div>
      {conversation.unreadCount > 0 ? (
        <span className="mt-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
          {conversation.unreadCount}
        </span>
      ) : null}
    </button>
  );
}
