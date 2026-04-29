"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { recordServiceViewClient } from "@/lib/api/service-views.client";

/**
 * Cuenta una vista al abrir el detalle (POST no corre con prefetch de enlaces).
 * setTimeout(0) + cleanup evita doble envío en React Strict Mode (desarrollo).
 */
export function ServiceViewTracker({ serviceId }: { serviceId: string }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const timerId = window.setTimeout(() => {
      if (cancelled) {
        return;
      }
      void recordServiceViewClient(serviceId).then((ok) => {
        if (!cancelled && ok) {
          router.refresh();
        }
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [serviceId, router]);

  return null;
}
