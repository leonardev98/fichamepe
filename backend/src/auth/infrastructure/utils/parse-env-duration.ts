export function parseEnvDurationToSeconds(
  value: string | undefined,
  fallbackSeconds: number,
): number {
  if (!value || typeof value !== 'string') {
    return fallbackSeconds;
  }
  const trimmed = value.trim();
  const match = /^(\d+)\s*([smhd])$/i.exec(trimmed);
  if (!match) {
    return fallbackSeconds;
  }
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const mult: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return amount * (mult[unit] ?? fallbackSeconds);
}
