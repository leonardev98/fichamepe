import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FP_REFRESH_COOKIE } from "@/lib/auth-cookies";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refresh = request.cookies.get(FP_REFRESH_COOKIE)?.value;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  if (isProtected && !refresh) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/onboarding",
    "/onboarding/:path*",
  ],
};
