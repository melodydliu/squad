import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/integrations/supabase/middleware";

const PROTECTED_PATHS = ["/admin", "/freelancer", "/project", "/notifications", "/profile"];
// /invite is intentionally NOT in PROTECTED_PATHS — accessible to unauthenticated users
const PUBLIC_ONLY_PATHS = ["/", "/signup"];

export async function middleware(request: NextRequest) {
  let user = null;
  let supabaseResponse = NextResponse.next({ request });

  try {
    const result = await updateSession(request);
    user = result.user;
    supabaseResponse = result.supabaseResponse;
  } catch {
    // If session refresh fails, treat as unauthenticated
  }

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from public-only routes
  if (user && PUBLIC_ONLY_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    // Role-based redirect stays client-side; default to /admin here
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
