import { NextResponse } from "next/server";
import { listModules, createModule, reorderModules } from "@/lib/modules/service";
import { CreateModuleSchema, ReorderModulesSchema } from "@/lib/zod/module";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id: courseId } = await params;
    const modules = await listModules(courseId);
    return NextResponse.json(modules);
  } catch {
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id: courseId } = await params;
    const body = await request.json();

    // Support reorder via POST with { modules: [...] }
    if (Array.isArray(body?.modules)) {
      const parsed = ReorderModulesSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      await reorderModules(courseId, parsed.data);
      return NextResponse.json({ success: true });
    }

    const parsed = CreateModuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const module = await createModule(courseId, parsed.data);
    return NextResponse.json(module, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 });
  }
}
