import { NextResponse, type NextRequest } from "next/server";
import {
  COUNTRY_COOKIE_NAME,
  detectCountryCodeFromHeaders,
  sanitizeContentCountryFilter,
} from "@/lib/country";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const detected = detectCountryCodeFromHeaders(request.headers);
  const fromCookie = sanitizeContentCountryFilter(
    request.cookies.get(COUNTRY_COOKIE_NAME)?.value ?? null,
  );
  const countryCode = fromCookie ?? sanitizeContentCountryFilter(detected) ?? null;

  const response = NextResponse.json({ countryCode });
  /** No guardamos país detectado por IP en cookie: el listado por defecto es sin filtro. */
  return response;
}
