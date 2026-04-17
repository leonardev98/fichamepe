/**
 * Etiqueta corta tipo "hace 5 minutos" / "ayer" para fechas en el pasado (es-PE).
 */
export function formatRelativePublishLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Reciente";
  }
  const now = Date.now();
  const diffMs = now - date.getTime();
  if (diffMs < 0) {
    return "Publicado hace un momento";
  }
  if (diffMs < 45_000) {
    return "Publicado hace un momento";
  }
  const rtf = new Intl.RelativeTimeFormat("es-PE", { numeric: "auto" });
  const diffMin = Math.round(-diffMs / 60_000);
  if (Math.abs(diffMin) < 60) {
    return `Publicado ${rtf.format(diffMin, "minute")}`;
  }
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) {
    return `Publicado ${rtf.format(diffHour, "hour")}`;
  }
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 14) {
    return `Publicado ${rtf.format(diffDay, "day")}`;
  }
  const d = date.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
  return `Publicado el ${d}`;
}
