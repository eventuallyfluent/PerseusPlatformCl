import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { markLessonComplete, getCourseProgress } from "@/lib/progress/service";

export const dynamic = "force-dynamic";

// POST /api/progress — mark a lesson as complete
const MarkCompleteSchema = z.object({
  lessonId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = MarkCompleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await markLessonComplete(session.user.id, parsed.data.lessonId);
  return NextResponse.json({ ok: true });
}

// GET /api/progress?courseId=xxx — get progress for a course
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseId = request.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  const progress = await getCourseProgress(session.user.id, courseId);
  return NextResponse.json(progress);
}
