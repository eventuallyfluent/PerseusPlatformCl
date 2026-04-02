import { db } from "@/lib/db";
import { getCourse } from "@/lib/courses/service";
import type {
  GeneratedSalesPagePayload,
  CourseWithRelations,
} from "@/types/index";

/**
 * Pure function — transforms course data into a typed sales page payload.
 * No database calls. Deterministic: same input always produces same output.
 */
export function generateSalesPagePayload(
  course: CourseWithRelations
): GeneratedSalesPagePayload {
  const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
    return [];
  };

  return {
    hero: {
      title: course.title,
      subtitle: course.subtitle ?? null,
      thumbnailUrl: course.thumbnailUrl ?? null,
    },

    video: course.previewVideoUrl ? { url: course.previewVideoUrl } : null,

    description: course.description ? { body: course.description } : null,

    outcomes: { items: toStringArray(course.learningOutcomes) },

    audience: { items: toStringArray(course.whoItsFor) },

    includes: { items: toStringArray(course.includes) },

    curriculum: {
      modules: course.modules.map((m) => ({
        title: m.title,
        lessonCount: m.lessons.length,
        lessons: m.lessons.map((l) => ({
          title: l.title,
          type: l.type,
          isPreview: l.isPreview,
          drip_days: l.drip_days ?? null,
        })),
      })),
    },

    instructor: {
      name: course.instructor.name,
      bio: course.instructor.bio ?? null,
      avatar: course.instructor.avatar ?? null,
      website: course.instructor.website ?? null,
      twitter: course.instructor.twitter ?? null,
      linkedin: course.instructor.linkedin ?? null,
    },

    testimonials: {
      items: course.testimonials.map((t) => ({
        name: t.name,
        role: t.role ?? null,
        avatar: t.avatar ?? null,
        body: t.body,
        rating: t.rating ?? null,
      })),
    },

    faq: {
      items: course.faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
    },

    cta: {
      offers: course.offers.map((o) => ({
        id: o.id,
        name: o.name,
        type: o.type,
        prices: o.prices.map((p) => ({
          id: p.id,
          amount: p.amount.toString(),
          currency: p.currency,
          isDefault: p.isDefault,
          billingInterval: p.billingInterval ?? null,
          trialDays: p.trialDays ?? null,
        })),
      })),
    },
  };
}

/**
 * Returns the stored GeneratedPage payload, generating and persisting it
 * if one does not yet exist. Respects overrideActive — does not regenerate
 * pages that have been manually overridden.
 */
export async function getOrGenerateSalesPage(courseId: string) {
  const existing = await db.generatedPage.findUnique({
    where: { courseId },
  });

  if (existing) {
    return existing;
  }

  // Generate fresh payload and persist
  return _generateAndPersist(courseId);
}

/**
 * Force-regenerates the sales page payload regardless of overrideActive.
 * Resets overrideActive to false.
 */
export async function regenerateSalesPage(courseId: string) {
  return _generateAndPersist(courseId);
}

/**
 * Sets the overrideActive flag on a GeneratedPage.
 * When true, course updates will not regenerate the page.
 */
export async function setSalesPageOverride(courseId: string, active: boolean) {
  return db.generatedPage.upsert({
    where: { courseId },
    update: { overrideActive: active },
    create: {
      courseId,
      payload: {},
      overrideActive: active,
    },
  });
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function _generateAndPersist(courseId: string) {
  const course = await getCourse(courseId);
  if (!course) throw new Error(`Course not found: ${courseId}`);

  const payload = generateSalesPagePayload(course);

  return db.generatedPage.upsert({
    where: { courseId },
    update: {
      payload: payload as object,
      overrideActive: false,
    },
    create: {
      courseId,
      payload: payload as object,
      overrideActive: false,
    },
  });
}
