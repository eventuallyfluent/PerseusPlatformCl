"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createCourse, updateCourse, deleteCourse } from "@/lib/courses/service";
import { createModule, updateModule, deleteModule } from "@/lib/modules/service";
import { createLesson, updateLesson, deleteLesson } from "@/lib/lessons/service";

// ─── Courses ──────────────────────────────────────────────────────────────────

export async function actionCreateCourse(formData: FormData) {
  const course = await createCourse({
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? "") || undefined,
    description: String(formData.get("description") ?? "") || undefined,
    instructorId: String(formData.get("instructorId") ?? ""),
    status: (formData.get("status") as "DRAFT" | "PUBLISHED") ?? "DRAFT",
    slug: String(formData.get("slug") ?? "") || undefined,
  });
  redirect(`/admin/courses/${course.id}`);
}

export async function actionUpdateCourse(id: string, formData: FormData) {
  await updateCourse(id, {
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? "") || undefined,
    description: String(formData.get("description") ?? "") || undefined,
    instructorId: String(formData.get("instructorId") ?? ""),
    status: (formData.get("status") as "DRAFT" | "PUBLISHED") ?? "DRAFT",
    slug: String(formData.get("slug") ?? "") || undefined,
    thumbnailUrl: String(formData.get("thumbnailUrl") ?? "") || undefined,
    previewVideoUrl: String(formData.get("previewVideoUrl") ?? "") || undefined,
  });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
}

export async function actionDeleteCourse(id: string) {
  await deleteCourse(id);
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

// ─── Modules ─────────────────────────────────────────────────────────────────

export async function actionCreateModule(courseId: string, formData: FormData) {
  await createModule(courseId, {
    title: String(formData.get("title") ?? ""),
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionUpdateModule(courseId: string, moduleId: string, formData: FormData) {
  await updateModule(moduleId, {
    title: String(formData.get("title") ?? ""),
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionDeleteModule(courseId: string, moduleId: string) {
  await deleteModule(moduleId);
  revalidatePath(`/admin/courses/${courseId}`);
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

export async function actionCreateLesson(courseId: string, moduleId: string, formData: FormData) {
  await createLesson(moduleId, {
    title: String(formData.get("title") ?? ""),
    type: (formData.get("type") as "VIDEO" | "TEXT" | "DOWNLOAD" | "MIXED") ?? "VIDEO",
    videoUrl: String(formData.get("videoUrl") ?? "") || undefined,
    content: String(formData.get("content") ?? "") || undefined,
    downloadUrl: String(formData.get("downloadUrl") ?? "") || undefined,
    isPreview: formData.get("isPreview") === "true",
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionUpdateLesson(courseId: string, lessonId: string, formData: FormData) {
  await updateLesson(lessonId, {
    title: String(formData.get("title") ?? ""),
    type: (formData.get("type") as "VIDEO" | "TEXT" | "DOWNLOAD" | "MIXED") ?? "VIDEO",
    videoUrl: String(formData.get("videoUrl") ?? "") || undefined,
    content: String(formData.get("content") ?? "") || undefined,
    downloadUrl: String(formData.get("downloadUrl") ?? "") || undefined,
    isPreview: formData.get("isPreview") === "true",
    status: (formData.get("status") as "DRAFT" | "PUBLISHED") ?? "DRAFT",
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionDeleteLesson(courseId: string, lessonId: string) {
  await deleteLesson(lessonId);
  revalidatePath(`/admin/courses/${courseId}`);
}
