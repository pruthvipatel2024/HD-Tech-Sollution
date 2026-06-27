import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protect all routes under admin/dashboard
  if (pathname.startsWith("/admin/dashboard")) {
    if (!token) {
      console.log("[Middleware] No token cookie found, redirecting to /admin/login");
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to dashboard if logged-in admin visits login page
  if (pathname === "/admin/login") {
    if (token) {
      console.log("[Middleware] Active token found, redirecting to dashboard");
      const dashboardUrl = new URL("/admin/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/login"],
};
