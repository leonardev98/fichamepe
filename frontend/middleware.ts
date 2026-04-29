import { NextResponse, type NextRequest } from "next/server";
import {
  COUNTRY_COOKIE_NAME,
  detectCountryCodeFromHeaders,
  isNavbarContentCountryCode,
  normalizeCountryCode,
} from "@/lib/country";

export function middleware(request: NextRequest) {
  const existing = normalizeCountryCode(
    request.cookies.get(COUNTRY_COOKIE_NAME)?.value ?? null,
  );

  if (existing && !isNavbarContentCountryCode(existing)) {
    const response = NextResponse.next();
    response.cookies.set(COUNTRY_COOKIE_NAME, "", {
      path: "/",
      sameSite: "lax",
      maxAge: 0,
    });
    return response;
  }

  if (existing) {
    return NextResponse.next();
  }

  const detected = detectCountryCodeFromHeaders(request.headers);
  if (!detected || !isNavbarContentCountryCode(detected)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set(COUNTRY_COOKIE_NAME, detected, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
