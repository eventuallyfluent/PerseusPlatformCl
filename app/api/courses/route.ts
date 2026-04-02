import { NextResponse } from "next/server";
import { listCourses, createCourse } from "@/lib/courses/service";
import { CreateCourseSchema } from "@/lib/zod/course";

export async function GET() {
  try {
    const courses = await listCourses();
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const course = await createCourse(parsed.data);
    return NextResponse.json(course, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
