import { NextResponse } from "next/server";
import { updateModule, deleteModule } from "@/lib/modules/service";
import { UpdateModuleSchema } from "@/lib/zod/module";

type Params = { params: Promise<{ id: string; moduleId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { moduleId } = await params;
    const body = await request.json();
    const parsed = UpdateModuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const module = await updateModule(moduleId, parsed.data);
    return NextResponse.json(module);
  } catch {
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { moduleId } = await params;
    await deleteModule(moduleId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 });
  }
}
