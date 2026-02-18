export const runtime = "nodejs";

import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes — no auth required
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/evaluate") ||
    pathname.startsWith("/scores") ||
    pathname.startsWith("/api/auth")
  ) {
    return;
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
