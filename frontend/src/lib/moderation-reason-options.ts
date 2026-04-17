import type { ModerationReportReason } from "@/types/moderation.types";

export const MODERATION_REASON_OPTIONS: Array<{
  value: ModerationReportReason;
  label: string;
}> = [
  { value: "fraud", label: "Posible estafa o cobro engañoso" },
  { value: "inappropriate_content", label: "Contenido inapropiado" },
  { value: "false_information", label: "Información falsa" },
  { value: "spam", label: "Spam o contenido repetido" },
  { value: "other", label: "Otro motivo" },
];

export function moderationReasonLabel(reason: string): string {
  return MODERATION_REASON_OPTIONS.find((o) => o.value === reason)?.label ?? reason;
}
