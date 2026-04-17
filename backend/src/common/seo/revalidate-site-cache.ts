type RevalidatePayload = {
  paths?: string[];
  tags?: string[];
};

function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/$/, '');
}

export async function revalidateSiteCache(
  payload: RevalidatePayload,
): Promise<void> {
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL;
  const secret = process.env.REVALIDATE_WEBHOOK_SECRET;
  if (!frontendBaseUrl || !secret) {
    return;
  }

  try {
    await fetch(`${normalizeBaseUrl(frontendBaseUrl)}/api/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // No bloquea la transacción principal si falla la revalidación SEO.
  }
}
