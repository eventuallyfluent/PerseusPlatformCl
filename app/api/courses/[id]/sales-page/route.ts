import { NextResponse } from "next/server";
import {
  getOrGenerateSalesPage,
  regenerateSalesPage,
  setSalesPageOverride,
} from "@/lib/sales-pages/service";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/courses/[id]/sales-page
 * Returns stored payload (auto-generates if none exists).
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const page = await getOrGenerateSalesPage(id);
    return NextResponse.json({
      payload: page.payload,
      overrideActive: page.overrideActive,
      updatedAt: page.updatedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get sales page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/courses/[id]/sales-page
 * Disables the override and regenerates the page from course data.
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await setSalesPageOverride(id, false);
    const page = await regenerateSalesPage(id);
    return NextResponse.json({
      payload: page.payload,
      overrideActive: page.overrideActive,
      updatedAt: page.updatedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reset sales page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
