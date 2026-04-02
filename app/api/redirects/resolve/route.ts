import { NextResponse } from "next/server";
import { resolveRedirect, resolveLegacyUrl, getCourseUrl } from "@/lib/urls/service";

/**
 * GET /api/redirects/resolve?path=/some/path
 *
 * Internal endpoint called exclusively by middleware.
 * Checks the Redirect table first, then falls back to Course.legacy_url lookups.
 * Returns { redirect: { toPath, isPermanent } } or { redirect: null }.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ redirect: null });
  }

  // 1. Check Redirect table
  const tableRedirect = await resolveRedirect(path);
  if (tableRedirect) {
    return NextResponse.json({ redirect: tableRedirect });
  }

  // 2. Check Course.legacy_url
  const legacyCourse = await resolveLegacyUrl(path);
  if (legacyCourse) {
    return NextResponse.json({
      redirect: {
        toPath: getCourseUrl(legacyCourse.slug),
        isPermanent: true,
      },
    });
  }

  return NextResponse.json({ redirect: null });
}
