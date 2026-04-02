import { NextResponse } from "next/server";
import { updateRedirect, deleteRedirect } from "@/lib/urls/service";
import { UpdateRedirectSchema } from "@/lib/zod/redirect";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateRedirectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const redirect = await updateRedirect(id, parsed.data);
    return NextResponse.json(redirect);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update redirect";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await deleteRedirect(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete redirect" }, { status: 500 });
  }
}
