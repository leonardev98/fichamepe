"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useNotificationsStore } from "@/stores/notificationsStore";
import type { AppNotification } from "@/types/notification.types";

function formatNotifTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return "Ahora";
  const rtf = new Intl.RelativeTimeFormat("es-PE", { numeric: "auto" });
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return rtf.format(-diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return rtf.format(-diffDay, "day");
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

type NotificationsPopoverProps = {
  onOpenChange: (open: boolean) => void;
};

export function NotificationsPopover({ onOpenChange }: NotificationsPopoverProps) {
  const router = useRouter();
  const items = useNotificationsStore((s) => s.items);
  const syncFromApi = useNotificationsStore((s) => s.syncFromApi);
  const markOneRead = useNotificationsStore((s) => s.markOneRead);

  useEffect(() => {
    void syncFromApi();
  }, [syncFromApi]);

  const onItemActivate = async (n: AppNotification) => {
    if (!n.readAt) {
      await markOneRead(n.id);
    }
    if (n.linkPath) {
      router.push(n.linkPath);
    } else {
      router.push("/notificaciones");
    }
    onOpenChange(false);
  };

  return (
    <div className="w-[min(100vw-2rem,360px)] rounded-2xl border border-border bg-white p-3 shadow-xl">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
        <Link
          href="/notificaciones"
          onClick={() => onOpenChange(false)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Ver todas
        </Link>
      </div>
      {!items.length ? (
        <p className="px-1 py-3 text-sm text-muted">No tienes notificaciones recientes.</p>
      ) : (
        <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1">
          {items.slice(0, 12).map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => void onItemActivate(n)}
              className={`flex w-full flex-col gap-0.5 rounded-xl px-2 py-2.5 text-left transition hover:bg-primary/[0.06] ${
                !n.readAt ? "bg-primary/[0.04]" : ""
              }`}
            >
              <span className="text-xs text-muted">{formatNotifTime(n.createdAt)}</span>
              <span className="text-sm font-semibold leading-snug text-foreground">{n.title}</span>
              {n.body ? (
                <span className="line-clamp-2 text-xs text-muted">{n.body}</span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
