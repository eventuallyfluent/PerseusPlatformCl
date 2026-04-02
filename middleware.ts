import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Perseus Platform — Combined Middleware
 *
 * 1. Admin guard: /admin/* requires a valid session with isAdmin=true.
 *    Unauthenticated → redirect to /admin/login.
 *    Authenticated non-admin → redirect to /.
 *
 * 2. URL redirects: all other non-asset, non-API requests are checked
 *    against the Redirect table via /api/redirects/resolve (delegated to
 *    avoid Prisma in Edge Runtime).
 *
 * /b/:legacyId excluded — handled by app/b/[legacyId]/route.ts (Node runtime).
 */
export default auth(async function middleware(request: NextRequest & { auth: unknown }) {
  const path = request.nextUrl.pathname;

  // ── Admin guard ─────────────────────────────────────────────────────────────
  if (path.startsWith("/admin")) {
    // Allow the login page through
    if (path === "/admin/login") {
      return NextResponse.next();
    }

    const session = (request as unknown as { auth: { user?: { isAdmin?: boolean } } | null }).auth;

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    if (!session.user?.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // ── URL redirect resolution ──────────────────────────────────────────────────
  try {
    const resolveUrl = new URL(
      `/api/redirects/resolve?path=${encodeURIComponent(path)}`,
      request.nextUrl.origin
    );

    const res = await fetch(resolveUrl.toString());

    if (res.ok) {
      const data = (await res.json()) as {
        redirect: { toPath: string; isPermanent: boolean } | null;
      };

      if (data.redirect) {
        const destination = new URL(data.redirect.toPath, request.url);
        return NextResponse.redirect(destination, {
          status: data.redirect.isPermanent ? 301 : 302,
        });
      }
    }
  } catch {
    // If resolve fails, pass through — never block the user
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - /api/* (internal API routes)
     *   - /b/*   (legacy ID handler)
     *   - /_next/static, /_next/image (static assets)
     *   - favicon.ico, robots.txt, sitemap.xml
     */
    "/((?!api|b/|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
