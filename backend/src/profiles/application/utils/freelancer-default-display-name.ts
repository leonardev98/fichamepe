/** Nombre público por defecto para un perfil de freelancer (alta OAuth o servicio sin perfil). */
export function freelancerDefaultDisplayName(
  fullName: string | null,
  email: string,
): string {
  const t = fullName?.trim();
  if (t) return t;
  const local = email.split('@')[0]?.trim();
  return local && local.length ? local : 'Usuario';
}
