/**
 * Cliente: registrar vista al abrir el detalle (el prefetch de Next no ejecuta POST).
 */
export async function recordServiceViewClient(serviceId: string): Promise<boolean> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!base) {
    return false;
  }
  try {
    const res = await fetch(`${base}/services/${encodeURIComponent(serviceId)}/view`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}
