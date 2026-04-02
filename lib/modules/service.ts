import { db } from "@/lib/db";
import type { CreateModuleInput, UpdateModuleInput, ReorderModulesInput } from "@/lib/zod/module";

export async function listModules(courseId: string) {
  return db.module.findMany({
    where: { courseId },
    orderBy: { position: "asc" },
    include: {
      lessons: { orderBy: { position: "asc" } },
    },
  });
}

export async function createModule(courseId: string, data: CreateModuleInput) {
  let position = data.position;

  if (position === undefined) {
    const last = await db.module.findFirst({
      where: { courseId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    position = (last?.position ?? -1) + 1;
  }

  return db.module.create({
    data: {
      courseId,
      title: data.title,
      position,
    },
    include: {
      lessons: true,
    },
  });
}

export async function updateModule(id: string, data: UpdateModuleInput) {
  return db.module.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.position !== undefined && { position: data.position }),
    },
  });
}

export async function reorderModules(courseId: string, data: ReorderModulesInput) {
  await db.$transaction(
    data.modules.map(({ id, position }) =>
      db.module.update({
        where: { id, courseId },
        data: { position },
      })
    )
  );
}

export async function deleteModule(id: string) {
  return db.module.delete({ where: { id } });
}
