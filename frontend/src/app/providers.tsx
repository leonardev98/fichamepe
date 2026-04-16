"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { PendingEmailVerificationToast } from "@/components/auth/PendingEmailVerificationToast";
import { AuthModalsProvider } from "@/components/auth/auth-modals-provider";
import { SessionBootstrap } from "@/components/SessionBootstrap";
import { ChatSocketProvider } from "@/components/conversaciones/ChatSocketProvider";

/**
 * HeroUI v3 no exporta `HeroUIProvider` desde `@heroui/react` (solo CSS + componentes).
 * Este `HeroUIProvider` local envuelve la app; `RouterProvider` aporta `navigate` para enlaces cliente (React Aria).
 */
export function HeroUIProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  return <RouterProvider navigate={router.push}>{children}</RouterProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7907/ingest/4ab00c66-c014-4f05-821f-8a55da88cb2b", {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "943a62",
      },
      body: JSON.stringify({
        sessionId: "943a62",
        runId: "run-1",
        hypothesisId: "H5",
        location: "src/app/providers.tsx:Providers.useEffect(init)",
        message: "providers-mounted",
        data: { pathname: window.location.pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const originalWarn = console.warn;
    const originalError = console.error;

    const serializeArgs = (args: unknown[]) =>
      args
        .map((arg) => {
          if (typeof arg === "string") return arg;
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(" ");

    const sendRuntimeLog = (level: "warn" | "error", args: unknown[]) => {
      const serialized = serializeArgs(args);

      if (!/PressResponder|cannot be a descendant of <button>|nested <button>/i.test(serialized)) {
        return;
      }

      const stackLine =
        args.find((arg) => typeof arg === "string" && /(src\/.+\.(tsx|ts):\d+:\d+)/.test(arg)) ?? null;
      const stackMatch =
        typeof stackLine === "string"
          ? stackLine.match(/(src\/.+\.(tsx|ts):\d+:\d+)/)
          : null;
      const sourceHint = stackMatch?.[1] ?? "unknown";

      // #region agent log
      fetch("http://127.0.0.1:7907/ingest/4ab00c66-c014-4f05-821f-8a55da88cb2b", {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "943a62",
        },
        body: JSON.stringify({
          sessionId: "943a62",
          runId: "run-1",
          hypothesisId: "H5",
          location: "src/app/providers.tsx:console-patch",
          message: "runtime-warning-captured",
          data: {
            level,
            pathname: window.location.pathname,
            sourceHint,
            text: serialized.slice(0, 1200),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    };

    const sendA11yLabelLog = (level: "warn" | "error", args: unknown[]) => {
      const serialized = serializeArgs(args);
      if (
        !/visible label|aria-label|aria-labelledby|Largest Contentful Paint|loading=\"eager\"/i.test(
          serialized,
        )
      ) {
        return;
      }

      // #region agent log
      fetch("http://127.0.0.1:7907/ingest/4ab00c66-c014-4f05-821f-8a55da88cb2b", {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "943a62",
        },
        body: JSON.stringify({
          sessionId: "943a62",
          runId: "run-1",
          hypothesisId: "H-A11Y",
          location: "src/app/providers.tsx:console-patch-a11y",
          message: "a11y-or-lcp-warning",
          data: {
            level,
            pathname: window.location.pathname,
            text: serialized.slice(0, 1200),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    };

    console.warn = (...args: unknown[]) => {
      sendRuntimeLog("warn", args);
      sendA11yLabelLog("warn", args);
      originalWarn(...args);
    };

    console.error = (...args: unknown[]) => {
      sendRuntimeLog("error", args);
      sendA11yLabelLog("error", args);
      originalError(...args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <HeroUIProvider>
      <EmailVerificationBanner />
      <PendingEmailVerificationToast />
      <SessionBootstrap />
      <ChatSocketProvider />
      <ServiceWorkerRegister />
      <AuthModalsProvider>{children}</AuthModalsProvider>
    </HeroUIProvider>
  );
}
