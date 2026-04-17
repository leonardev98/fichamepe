import { NextResponse, type NextRequest } from "next/server";
import {
  COUNTRY_COOKIE_NAME,
  detectCountryCodeFromHeaders,
  normalizeCountryCode,
} from "@/lib/country";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const detected = detectCountryCodeFromHeaders(request.headers);
  const fromCookie = normalizeCountryCode(
    request.cookies.get(COUNTRY_COOKIE_NAME)?.value ?? null,
  );
  const countryCode = fromCookie ?? detected ?? null;

  const response = NextResponse.json({ countryCode });
  if (countryCode && !fromCookie) {
    response.cookies.set(COUNTRY_COOKIE_NAME, countryCode, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}
