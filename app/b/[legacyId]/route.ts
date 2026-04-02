import { NextResponse } from "next/server";
import { resolveLegacyId } from "@/lib/urls/service";
import { getCourseUrl } from "@/lib/urls/service";

type Params = { params: Promise<{ legacyId: string }> };

/**
 * GET /b/:legacyId
 *
 * Handles Payhip-style legacy URLs (e.g. /b/OWFpo).
 * Looks up the course by legacy_id and issues a 301 permanent redirect
 * to the canonical course URL (/course/{slug}).
 */
export async function GET(request: Request, { params }: Params) {
  const { legacyId } = await params;

  const resolved = await resolveLegacyId(legacyId);

  if (!resolved) {
    return NextResponse.json(
      { error: `No course found for legacy ID: ${legacyId}` },
      { status: 404 }
    );
  }

  const canonicalUrl = new URL(
    getCourseUrl(resolved.slug),
    request.url
  );

  return NextResponse.redirect(canonicalUrl, { status: 301 });
}
