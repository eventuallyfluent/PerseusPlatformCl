import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseCSV } from "@/lib/csv/parser";
import { validateAndPlan } from "@/lib/imports/validator";
import { executeImport } from "@/lib/imports/executor";

export const dynamic = "force-dynamic";

// ─── POST /api/imports ────────────────────────────────────────────────────────
// Accepts multipart/form-data: { file: File, dryRun?: "true"|"false" }

export async function POST(req: NextRequest) {
  let batch: Awaited<ReturnType<typeof db.importBatch.create>> | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const dryRunRaw = formData.get("dryRun");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Missing file field in multipart form" },
        { status: 400 }
      );
    }

    const dryRun = dryRunRaw === "true";

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Parse CSV
    const { data: rawRows, errors: parseErrors } = parseCSV(buffer);

    if (parseErrors.length > 0 && rawRows.length === 0) {
      return NextResponse.json(
        { error: "CSV parse failed", details: parseErrors },
        { status: 422 }
      );
    }

    // 2. Validate + plan
    const plan = validateAndPlan(rawRows);

    // 3. Create ImportBatch row (skip for dry-run — still record for audit)
    batch = await db.importBatch.create({
      data: {
        filename: file.name ?? "upload.csv",
        status: "RUNNING",
        type: "COURSE",
        rowCount: plan.rowCount,
        errorCount: plan.errors.length,
        dryRun,
      },
    });

    // 4. Execute (or dry-run)
    const summary = await executeImport(plan, dryRun);

    // 5. Update batch to COMPLETED
    const updatedBatch = await db.importBatch.update({
      where: { id: batch.id },
      data: {
        status: "COMPLETED",
        errorCount: summary.errors.length,
        summary: summary as object,
      },
    });

    return NextResponse.json(updatedBatch, { status: 200 });
  } catch (err) {
    // If batch was created, mark it as FAILED
    if (batch) {
      await db.importBatch
        .update({
          where: { id: batch.id },
          data: {
            status: "FAILED",
            summary: { error: String(err) } as object,
          },
        })
        .catch(() => {}); // swallow secondary failure
    }

    console.error("[POST /api/imports]", err);
    return NextResponse.json(
      { error: "Import failed", details: String(err) },
      { status: 500 }
    );
  }
}

// ─── GET /api/imports ─────────────────────────────────────────────────────────
// Returns all ImportBatch records ordered by createdAt desc

export async function GET() {
  try {
    const batches = await db.importBatch.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(batches);
  } catch (err) {
    console.error("[GET /api/imports]", err);
    return NextResponse.json({ error: "Failed to list batches" }, { status: 500 });
  }
}
