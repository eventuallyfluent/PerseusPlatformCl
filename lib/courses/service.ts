import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { CreateCourseInput, UpdateCourseInput } from "@/lib/zod/course";
import { regenerateSalesPage } from "@/lib/sales-pages/service";

export async function listCourses(filters?: { status?: string }) {
  return db.course.findMany({
    where: filters?.status ? { status: filters.status as never } : undefined,
    include: {
      instructor: { select: { id: true, name: true, avatar: true } },
      offers: { where: { isActive: true }, include: { prices: true } },
      _count: { select: { modules: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourse(id: string) {
  return db.course.findUnique({
    where: { id },
    include: {
      instructor: true,
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: { orderBy: { position: "asc" } },
        },
      },
      faqs: { orderBy: { position: "asc" } },
      testimonials: { orderBy: { createdAt: "desc" } },
      offers: {
        where: { isActive: true },
        include: { prices: true },
      },
    },
  });
}

export async function getCourseBySlug(slug: string) {
  return db.course.findUnique({
    where: { slug },
    include: {
      instructor: true,
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: { orderBy: { position: "asc" } },
        },
      },
      faqs: { orderBy: { position: "asc" } },
      testimonials: { orderBy: { createdAt: "desc" } },
      offers: {
        where: { isActive: true },
        include: { prices: true },
      },
    },
  });
}

export async function createCourse(data: CreateCourseInput) {
  const slug = data.slug ?? slugify(data.title);

  // Ensure slug uniqueness
  const existing = await db.course.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  return db.course.create({
    data: {
      title: data.title,
      slug: finalSlug,
      subtitle: data.subtitle,
      description: data.description,
      instructorId: data.instructorId,
      status: data.status ?? "DRAFT",
    },
    include: {
      instructor: { select: { id: true, name: true } },
    },
  });
}

export async function updateCourse(id: string, data: UpdateCourseInput) {
  const updateData: Parameters<typeof db.course.update>[0]["data"] = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.instructorId !== undefined) updateData.instructorId = data.instructorId;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;
  if (data.previewVideoUrl !== undefined) updateData.previewVideoUrl = data.previewVideoUrl;
  if (data.learningOutcomes !== undefined) updateData.learningOutcomes = data.learningOutcomes ?? undefined;
  if (data.whoItsFor !== undefined) updateData.whoItsFor = data.whoItsFor ?? undefined;
  if (data.includes !== undefined) updateData.includes = data.includes ?? undefined;
  if (data.legacy_url !== undefined) updateData.legacy_url = data.legacy_url;
  if (data.legacy_id !== undefined) updateData.legacy_id = data.legacy_id;

  const course = await db.course.update({
    where: { id },
    data: updateData,
    include: {
      instructor: { select: { id: true, name: true } },
    },
  });

  // Auto-regenerate sales page unless override is active
  const page = await db.generatedPage.findUnique({
    where: { courseId: id },
    select: { overrideActive: true },
  });
  if (!page || !page.overrideActive) {
    await regenerateSalesPage(id);
  }

  return course;
}

export async function deleteCourse(id: string) {
  return db.course.delete({ where: { id } });
}
