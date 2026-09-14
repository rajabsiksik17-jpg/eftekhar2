import { NextResponse, type NextRequest } from "next/server";

const EXCLUDED = ["/admin", "/api", "/_next", "/favicon", "/sitemap", "/robots"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isExcluded = EXCLUDED.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "."),
  );
  const hasFileExt = /\.[a-zA-Z0-9]+$/.test(pathname);

  const lang = pathname.startsWith("/en") ? "en" : "ar";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-lang", lang);
  requestHeaders.set("x-pathname", pathname);

  const isLocalized =
    pathname === "/ar" ||
    pathname.startsWith("/ar/") ||
    pathname === "/en" ||
    pathname.startsWith("/en/");

  if (isLocalized || isExcluded || hasFileExt) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const url = request.nextUrl.clone();
  const path = pathname === "/" ? "" : pathname;
  url.pathname = `/${lang}${path}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
