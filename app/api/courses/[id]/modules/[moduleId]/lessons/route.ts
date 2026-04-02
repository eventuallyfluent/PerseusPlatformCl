import { NextResponse } from "next/server";
import { listLessons, createLesson, reorderLessons } from "@/lib/lessons/service";
import { CreateLessonSchema, ReorderLessonsSchema } from "@/lib/zod/lesson";

type Params = { params: Promise<{ id: string; moduleId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { moduleId } = await params;
    const lessons = await listLessons(moduleId);
    return NextResponse.json(lessons);
  } catch {
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { moduleId } = await params;
    const body = await request.json();

    // Support reorder via POST with { lessons: [...] }
    if (Array.isArray(body?.lessons)) {
      const parsed = ReorderLessonsSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }
      await reorderLessons(moduleId, parsed.data);
      return NextResponse.json({ success: true });
    }

    const parsed = CreateLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const lesson = await createLesson(moduleId, parsed.data);
    return NextResponse.json(lesson, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
