import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── GET /api/imports/[id] ────────────────────────────────────────────────────
// Returns a single ImportBatch with full summary JSON

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const batch = await db.importBatch.findUnique({
      where: { id },
    });

    if (!batch) {
      return NextResponse.json({ error: "Import batch not found" }, { status: 404 });
    }

    return NextResponse.json(batch);
  } catch (err) {
    console.error("[GET /api/imports/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch batch" }, { status: 500 });
  }
}
