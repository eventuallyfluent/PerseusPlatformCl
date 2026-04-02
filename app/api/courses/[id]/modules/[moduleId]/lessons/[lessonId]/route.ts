import { NextResponse } from "next/server";
import { getLesson, updateLesson, deleteLesson } from "@/lib/lessons/service";
import { UpdateLessonSchema } from "@/lib/zod/lesson";

type Params = { params: Promise<{ id: string; moduleId: string; lessonId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { lessonId } = await params;
    const lesson = await getLesson(lessonId);
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    return NextResponse.json(lesson);
  } catch {
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { lessonId } = await params;
    const body = await request.json();
    const parsed = UpdateLessonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const lesson = await updateLesson(lessonId, parsed.data);
    return NextResponse.json(lesson);
  } catch {
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { lessonId } = await params;
    await deleteLesson(lessonId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
}
