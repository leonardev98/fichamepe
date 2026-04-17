"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAuthModals } from "@/components/auth/auth-modals-context";
import { useAuthStore } from "@/store/auth.store";
import { ReportContentModal } from "./ReportContentModal";

type ReportUserButtonProps = {
  reportedUserId: string;
  displayName: string;
};

export function ReportUserButton({ reportedUserId, displayName }: ReportUserButtonProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { openLogin } = useAuthModals();
  const [open, setOpen] = useState(false);

  if (currentUserId === reportedUserId) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!isAuthenticated) {
            openLogin();
            return;
          }
          setOpen(true);
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent-red/35 px-4 py-2 text-sm font-semibold text-accent-red transition hover:bg-accent-red/5 sm:w-auto"
      >
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        Reportar perfil
      </button>

      <ReportContentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        targetType="user"
        targetId={reportedUserId}
        title="Reportar usuario"
        subtitle={`Indica el problema con la cuenta de ${displayName}.`}
      />
    </>
  );
}
