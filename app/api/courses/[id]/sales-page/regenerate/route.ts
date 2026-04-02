import { NextResponse } from "next/server";
import { regenerateSalesPage } from "@/lib/sales-pages/service";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/courses/[id]/sales-page/regenerate
 * Force-regenerates the payload from current course data.
 * Resets overrideActive to false.
 */
export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const page = await regenerateSalesPage(id);
    return NextResponse.json({
      payload: page.payload,
      overrideActive: page.overrideActive,
      updatedAt: page.updatedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to regenerate sales page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
