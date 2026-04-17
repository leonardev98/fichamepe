"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createModerationReport } from "@/lib/api/moderation-reports.api";
import { MODERATION_REASON_OPTIONS } from "@/lib/moderation-reason-options";
import { parseApiErrorMessage } from "@/lib/api/auth.api";
import type { ModerationReportReason, ModerationTargetType } from "@/types/moderation.types";

type ReportContentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetType: ModerationTargetType;
  targetId: string;
  title: string;
  subtitle?: string;
  onSubmitted?: () => void;
};

export function ReportContentModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  title,
  subtitle = "Cuéntanos qué ocurrió para que el equipo pueda revisarlo.",
  onSubmitted,
}: ReportContentModalProps) {
  const [reason, setReason] = useState<ModerationReportReason>("fraud");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("fraud");
      setDetails("");
      setError(null);
    }
  }, [isOpen, targetType, targetId]);

  if (!isOpen) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createModerationReport({
        targetType,
        targetId,
        reason,
        details: details.trim() ? details.trim() : undefined,
      });
      onSubmitted?.();
      onClose();
    } catch (e: unknown) {
      setError(parseApiErrorMessage(e, "No pudimos enviar el reporte. Inténtalo nuevamente."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted transition hover:border-primary/40 hover:text-primary"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={(e) => void submit(e)}>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Motivo</legend>
            {MODERATION_REASON_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-2.5 text-sm text-foreground transition hover:border-primary/35"
              >
                <input
                  type="radio"
                  name="reason"
                  value={option.value}
                  checked={reason === option.value}
                  onChange={() => setReason(option.value)}
                  className="mt-0.5 accent-primary"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-foreground">Detalle adicional (opcional)</span>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1000}
              rows={4}
              className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              placeholder="Describe brevemente qué pasó..."
            />
            <span className="mt-1 block text-right text-xs text-muted">{details.length}/1000</span>
          </label>

          {error ? <p className="text-sm text-accent-red">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-primary/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Enviando...
                </>
              ) : (
                "Enviar reporte"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
