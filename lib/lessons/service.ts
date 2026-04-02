import { db } from "@/lib/db";
import type { CreateLessonInput, UpdateLessonInput, ReorderLessonsInput } from "@/lib/zod/lesson";

export async function listLessons(moduleId: string) {
  return db.lesson.findMany({
    where: { moduleId },
    orderBy: { position: "asc" },
  });
}

export async function getLesson(id: string) {
  return db.lesson.findUnique({ where: { id } });
}

export async function createLesson(moduleId: string, data: CreateLessonInput) {
  let position = data.position;

  if (position === undefined) {
    const last = await db.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    position = (last?.position ?? -1) + 1;
  }

  return db.lesson.create({
    data: {
      moduleId,
      title: data.title,
      type: data.type ?? "VIDEO",
      position,
      videoUrl: data.videoUrl ?? null,
      content: data.content ?? null,
      downloadUrl: data.downloadUrl ?? null,
      drip_days: data.drip_days ?? null,
      isPreview: data.isPreview ?? false,
    },
  });
}

export async function updateLesson(id: string, data: UpdateLessonInput) {
  return db.lesson.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.downloadUrl !== undefined && { downloadUrl: data.downloadUrl }),
      ...(data.drip_days !== undefined && { drip_days: data.drip_days }),
      ...(data.isPreview !== undefined && { isPreview: data.isPreview }),
    },
  });
}

export async function reorderLessons(moduleId: string, data: ReorderLessonsInput) {
  await db.$transaction(
    data.lessons.map(({ id, position }) =>
      db.lesson.update({
        where: { id, moduleId },
        data: { position },
      })
    )
  );
}

export async function deleteLesson(id: string) {
  return db.lesson.delete({ where: { id } });
}
