"use client";

import { Suspense, useCallback, useMemo, useState, type ReactNode } from "react";
import { useOverlayState } from "@heroui/react";
import { AuthModalsContext } from "@/components/auth/auth-modals-context";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { LoginModal } from "@/components/auth/LoginModal";
import { RegisterModal } from "@/components/auth/RegisterModal";
import { ReferralLinkOpener } from "@/components/auth/ReferralLinkOpener";

export function AuthModalsProvider({ children }: { children: ReactNode }) {
  const loginState = useOverlayState();
  const registerState = useOverlayState();
  const forgotPasswordState = useOverlayState();
  const [registerInitialRole, setRegisterInitialRole] = useState<
    "client" | "freelancer" | null
  >(null);
  const [registerReferralCode, setRegisterReferralCode] = useState<string | null>(null);
  const [afterLoginHref, setAfterLoginHref] = useState<string | null>(null);

  const clearRegisterExtras = useCallback(() => {
    setRegisterInitialRole(null);
    setRegisterReferralCode(null);
  }, []);

  const openLogin = useCallback(
    (opts?: { afterLoginHref?: string }) => {
      const raw = opts?.afterLoginHref?.trim();
      const next =
        raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
      setAfterLoginHref(next);
      registerState.close();
      forgotPasswordState.close();
      loginState.open();
    },
    [loginState, registerState, forgotPasswordState],
  );

  const openRegister = useCallback(
    (opts?: { role?: "client" | "freelancer"; referralCode?: string | null }) => {
      setRegisterInitialRole(opts?.role ?? null);
      const rc = opts?.referralCode?.trim();
      setRegisterReferralCode(rc ? rc.toUpperCase() : null);
      loginState.close();
      forgotPasswordState.close();
      registerState.open();
    },
    [loginState, registerState, forgotPasswordState],
  );

  const openForgotPassword = useCallback(() => {
    loginState.close();
    registerState.close();
    forgotPasswordState.open();
  }, [loginState, registerState, forgotPasswordState]);

  const value = useMemo(
    () => ({ openLogin, openRegister, openForgotPassword }),
    [openLogin, openRegister, openForgotPassword],
  );

  return (
    <AuthModalsContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <ReferralLinkOpener />
      </Suspense>
      {forgotPasswordState.isOpen ? (
        <ForgotPasswordModal state={forgotPasswordState} />
      ) : null}
      {loginState.isOpen ? (
        <Suspense fallback={null}>
          <LoginModal state={loginState} afterLoginHref={afterLoginHref} />
        </Suspense>
      ) : null}
      {registerState.isOpen ? (
        <RegisterModal
          state={registerState}
          initialRole={registerInitialRole}
          initialReferralCode={registerReferralCode}
          onClosed={clearRegisterExtras}
          onSwitchToLogin={openLogin}
        />
      ) : null}
    </AuthModalsContext.Provider>
  );
}
