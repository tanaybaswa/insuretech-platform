import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  const isAuthRoute = pathname.startsWith("/login");
  const isVendorRoute = pathname.startsWith("/vendor");
  const isUnderwriterRoute = pathname.startsWith("/underwriter");
  const isProtected = isVendorRoute || isUnderwriterRoute;

  if (!isLoggedIn && isProtected) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && (pathname === "/" || isAuthRoute)) {
    const dest =
      session.user.role === "VENDOR" ? "/vendor" : "/underwriter";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  if (isLoggedIn && isVendorRoute && session.user.role !== "VENDOR") {
    return NextResponse.redirect(new URL("/underwriter", req.nextUrl.origin));
  }

  if (
    isLoggedIn &&
    isUnderwriterRoute &&
    session.user.role !== "UNDERWRITER"
  ) {
    return NextResponse.redirect(new URL("/vendor", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/login", "/vendor/:path*", "/underwriter/:path*"],
};
