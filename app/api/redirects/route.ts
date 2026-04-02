import { NextResponse } from "next/server";
import { listRedirects, createRedirect } from "@/lib/urls/service";
import { CreateRedirectSchema } from "@/lib/zod/redirect";

export async function GET() {
  try {
    const redirects = await listRedirects();
    return NextResponse.json(redirects);
  } catch {
    return NextResponse.json({ error: "Failed to fetch redirects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateRedirectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { fromPath, toPath, isPermanent } = parsed.data;
    const redirect = await createRedirect(fromPath, toPath, isPermanent);
    return NextResponse.json(redirect, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create redirect";
    // Conflict errors from detectConflict get a 409
    const status = message.includes("conflicts") || message.includes("already has") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
