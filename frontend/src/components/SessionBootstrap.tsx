"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { bootstrapSessionFromCookies } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export function SessionBootstrap() {
  const router = useRouter();
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (useAuthStore.getState().accessToken) return;
    void bootstrapSessionFromCookies().then((ok) => {
      if (!ok) {
        useAuthStore.getState().logout();
        return;
      }
      if (
        typeof window !== "undefined" &&
        window.location.pathname === "/"
      ) {
        const role = useAuthStore.getState().user?.role;
        if (role === "freelancer") {
          router.replace("/dashboard");
        } else {
          router.replace("/explorar");
        }
      }
    });
  }, [router]);
  return null;
}
