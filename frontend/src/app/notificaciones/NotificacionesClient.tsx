"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@heroui/react/button";
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
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NotificacionesClient() {
  const router = useRouter();
  const items = useNotificationsStore((s) => s.items);
  const total = useNotificationsStore((s) => s.total);
  const syncFromApi = useNotificationsStore((s) => s.syncFromApi);
  const loadMore = useNotificationsStore((s) => s.loadMore);
  const markOneRead = useNotificationsStore((s) => s.markOneRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await syncFromApi();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [syncFromApi]);

  const onLoadMore = async () => {
    setLoadingMore(true);
    try {
      await loadMore();
    } finally {
      setLoadingMore(false);
    }
  };

  const onActivate = async (n: AppNotification) => {
    if (!n.readAt) {
      await markOneRead(n.id);
    }
    if (n.linkPath) {
      router.push(n.linkPath);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {total === 0 && !loading
            ? "Cuando tengas novedades sobre tus publicaciones o solicitudes, aparecerán aquí."
            : `Mostrando ${items.length} de ${total} notificaciones.`}
        </p>
        {items.some((i) => !i.readAt) ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 self-start rounded-full border-border"
            onPress={() => void markAllRead()}
          >
            Marcar todas como leídas
          </Button>
        ) : null}
      </div>
      {loading ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : !items.length ? (
        <p className="rounded-xl border border-dashed border-border bg-white/50 px-4 py-8 text-center text-sm text-muted">
          No hay notificaciones todavía.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => void onActivate(n)}
                className={`w-full rounded-xl border border-border p-4 text-left transition hover:border-primary/35 hover:bg-primary/[0.03] ${
                  !n.readAt ? "bg-primary/[0.04]" : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted">{formatNotifTime(n.createdAt)}</span>
                  {!n.readAt ? (
                    <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                  ) : null}
                </div>
                <p className="mt-1 font-semibold text-foreground">{n.title}</p>
                {n.body ? <p className="mt-1 text-sm text-muted">{n.body}</p> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!loading && items.length < total ? (
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            isPending={loadingMore}
            onPress={() => void onLoadMore()}
          >
            Cargar más
          </Button>
        </div>
      ) : null}
    </>
  );
}
