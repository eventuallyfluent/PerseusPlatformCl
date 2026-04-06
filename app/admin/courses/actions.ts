"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCourse, updateCourse, deleteCourse } from "@/lib/courses/service";
import { createModule, updateModule, deleteModule } from "@/lib/modules/service";
import { createLesson, updateLesson, deleteLesson } from "@/lib/lessons/service";

async function requireAdmin() {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
  if (!isAdmin) redirect("/admin/login");
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export async function actionCreateCourse(formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  await deleteCourse(id);
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

// ─── Modules ─────────────────────────────────────────────────────────────────

export async function actionCreateModule(courseId: string, formData: FormData) {
  await requireAdmin();
  await createModule(courseId, {
    title: String(formData.get("title") ?? ""),
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionUpdateModule(courseId: string, moduleId: string, formData: FormData) {
  await requireAdmin();
  await updateModule(moduleId, {
    title: String(formData.get("title") ?? ""),
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionDeleteModule(courseId: string, moduleId: string) {
  await requireAdmin();
  await deleteModule(moduleId);
  revalidatePath(`/admin/courses/${courseId}`);
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

export async function actionCreateLesson(courseId: string, moduleId: string, formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
  await updateLesson(lessonId, {
    title: String(formData.get("title") ?? ""),
    type: (formData.get("type") as "VIDEO" | "TEXT" | "DOWNLOAD" | "MIXED") ?? "VIDEO",
    videoUrl: String(formData.get("videoUrl") ?? "") || undefined,
    content: String(formData.get("content") ?? "") || undefined,
    downloadUrl: String(formData.get("downloadUrl") ?? "") || undefined,
    isPreview: formData.get("isPreview") === "true",
    status: (formData.get("status") as "DRAFT" | "PUBLISHED") ?? "DRAFT",
    drip_days: formData.get("drip_days") ? Number(formData.get("drip_days")) : undefined,
  });
  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function actionDeleteLesson(courseId: string, lessonId: string) {
  await requireAdmin();
  await deleteLesson(lessonId);
  revalidatePath(`/admin/courses/${courseId}`);
}

// ─── Offers ──────────────────────────────────────────────────────────────────

export async function actionCreateOffer(courseId: string, formData: FormData) {
  await requireAdmin();
  await db.offer.create({
    data: {
      courseId,
      name: String(formData.get("name") ?? ""),
      type: (formData.get("type") as "ONE_TIME" | "SUBSCRIPTION" | "PAYMENT_PLAN") ?? "ONE_TIME",
      isActive: true,
    },
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionToggleOffer(courseId: string, offerId: string, isActive: boolean) {
  await requireAdmin();
  await db.offer.update({ where: { id: offerId }, data: { isActive } });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionDeleteOffer(courseId: string, offerId: string) {
  await requireAdmin();
  await db.offer.delete({ where: { id: offerId } });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionCreatePrice(courseId: string, offerId: string, formData: FormData) {
  await requireAdmin();
  const amount = parseFloat(String(formData.get("amount") ?? "0"));
  const currency = String(formData.get("currency") ?? "USD").toUpperCase();
  const isDefault = formData.get("isDefault") === "true";

  // If setting as default, clear existing defaults first
  if (isDefault) {
    await db.price.updateMany({ where: { offerId }, data: { isDefault: false } });
  }

  await db.price.create({
    data: {
      offerId,
      amount,
      currency,
      isDefault,
      billingInterval: String(formData.get("billingInterval") ?? "") || null,
      trialDays: formData.get("trialDays") ? Number(formData.get("trialDays")) : null,
    },
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionDeletePrice(courseId: string, priceId: string) {
  await requireAdmin();
  await db.price.delete({ where: { id: priceId } });
  revalidatePath(`/admin/courses/${courseId}`);
}

// ─── FAQs ────────────────────────────────────────────────────────────────────

export async function actionCreateFAQ(courseId: string, formData: FormData) {
  await requireAdmin();
  const last = await db.fAQ.findFirst({
    where: { courseId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  await db.fAQ.create({
    data: {
      courseId,
      question: String(formData.get("question") ?? ""),
      answer: String(formData.get("answer") ?? ""),
      position: (last?.position ?? -1) + 1,
    },
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionDeleteFAQ(courseId: string, faqId: string) {
  await requireAdmin();
  await db.fAQ.delete({ where: { id: faqId } });
  revalidatePath(`/admin/courses/${courseId}`);
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function actionCreateTestimonial(courseId: string, formData: FormData) {
  await requireAdmin();
  await db.testimonial.create({
    data: {
      courseId,
      name: String(formData.get("name") ?? ""),
      role: String(formData.get("role") ?? "") || null,
      body: String(formData.get("body") ?? ""),
      rating: formData.get("rating") ? Number(formData.get("rating")) : null,
    },
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function actionDeleteTestimonial(courseId: string, testimonialId: string) {
  await requireAdmin();
  await db.testimonial.delete({ where: { id: testimonialId } });
  revalidatePath(`/admin/courses/${courseId}`);
}

// ─── Manual Enrollment ────────────────────────────────────────────────────────

export async function actionManualEnroll(courseId: string, formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;

  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    // Can't throw from Server Action cleanly — redirect with error signal
    redirect(`/admin/courses/${courseId}?enrollError=User+not+found`);
  }

  // Check for existing enrollment
  const existing = await db.enrollment.findFirst({
    where: { userId: user.id, courseId },
  });
  if (!existing) {
    await db.enrollment.create({
      data: { userId: user.id, courseId, orderId: null },
    });
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/admin/users`);
}
