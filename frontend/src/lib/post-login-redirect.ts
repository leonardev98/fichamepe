import type { UserRole } from "@/types/auth";

const ALLOWED_PREFIXES = [
  "/dashboard",
  "/cuenta",
  "/cuenta/solicitudes",
  "/explorar",
  "/servicios",
  "/perfil",
  "/skills",
  "/conversaciones",
  "/solicitar",
] as const;

/**
 * Devuelve un pathname interno seguro a partir del query `from`, o null si no es usable.
 */
export function sanitizePostLoginFrom(from: string | null | undefined): string | null {
  if (from == null || typeof from !== "string") return null;
  const trimmed = from.trim();
  if (!trimmed) return null;
  if (trimmed === "/") return "/";
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//")) return null;
  if (trimmed.includes("\\") || trimmed.includes("\0")) return null;
  const pathOnly = trimmed.split("?")[0]!.split("#")[0]!;
  if (!pathOnly.startsWith("/") || pathOnly.startsWith("//")) return null;

  const ok =
    pathOnly === "/" ||
    ALLOWED_PREFIXES.some((p) => pathOnly === p || pathOnly.startsWith(`${p}/`));

  return ok ? pathOnly : null;
}

/**
 * Ruta post-login: respeta `from` solo si es pathname interno permitido; `/dashboard` solo para admin.
 */
export function resolvePostLoginHref(
  role: UserRole,
  from: string | null | undefined,
): string {
  const path = sanitizePostLoginFrom(from);
  if (!path || path === "/") return "/";

  if (path === "/dashboard" || path.startsWith("/dashboard/")) {
    if (role !== "admin") return "/";
    return path;
  }

  return path;
}
