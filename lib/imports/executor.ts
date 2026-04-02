import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getCourseUrl, createRedirect } from "@/lib/urls/service";
import type { ImportPlan, ImportError } from "@/lib/imports/validator";

// ─── Summary type ─────────────────────────────────────────────────────────────

export type ImportSummary = {
  dryRun: boolean;
  coursesCreated: number;
  coursesUpdated: number;
  modulesCreated: number;
  modulesUpdated: number;
  lessonsCreated: number;
  lessonsUpdated: number;
  redirectsCreated: number;
  offersCreated: number;
  errors: ImportError[];
  plan?: ImportPlan; // included on dry-run
};

// ─── Executor ─────────────────────────────────────────────────────────────────

/**
 * Executes an ImportPlan against the database.
 * When dryRun=true: validates what would happen without writing anything.
 * When dryRun=false: performs idempotent upserts for all entities.
 */
export async function executeImport(
  plan: ImportPlan,
  dryRun: boolean
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    dryRun,
    coursesCreated: 0,
    coursesUpdated: 0,
    modulesCreated: 0,
    modulesUpdated: 0,
    lessonsCreated: 0,
    lessonsUpdated: 0,
    redirectsCreated: 0,
    offersCreated: 0,
    errors: [...plan.errors],
  };

  // Dry-run: return plan + projected counts without writing
  if (dryRun) {
    summary.plan = plan;

    // Project what would happen
    const existingCourse = await findExistingCourse(plan.course.slug, plan.course.legacyId);
    summary.coursesCreated = existingCourse ? 0 : 1;
    summary.coursesUpdated = existingCourse ? 1 : 0;

    for (const mod of plan.modules) {
      const existingModule = existingCourse
        ? await db.module.findFirst({
            where: { courseId: existingCourse.id, position: mod.position },
          })
        : null;
      summary.modulesCreated += existingModule ? 0 : 1;
      summary.modulesUpdated += existingModule ? 1 : 0;

      for (const lesson of mod.lessons) {
        const existingLesson = existingModule
          ? await db.lesson.findFirst({
              where: { moduleId: existingModule.id, position: lesson.position },
            })
          : null;
        summary.lessonsCreated += existingLesson ? 0 : 1;
        summary.lessonsUpdated += existingLesson ? 1 : 0;
      }
    }

    if (plan.course.legacyUrl) summary.redirectsCreated = 1;
    if (plan.offer) summary.offersCreated = 1;

    return summary;
  }

  // ── Real import ──────────────────────────────────────────────────────────────

  // 1. Instructor — find by name or create
  const instructor = await upsertInstructor(
    plan.course.instructorName,
    plan.course.instructorBio
  );

  // 2. Course — upsert by legacy_id → slug
  const existingCourse = await findExistingCourse(plan.course.slug, plan.course.legacyId);

  let courseId: string;

  if (existingCourse) {
    await db.course.update({
      where: { id: existingCourse.id },
      data: {
        title: plan.course.title,
        subtitle: plan.course.subtitle ?? null,
        description: plan.course.description ?? null,
        status: plan.course.status,
        thumbnailUrl: plan.course.thumbnailUrl ?? null,
        previewVideoUrl: plan.course.previewVideoUrl ?? null,
        learningOutcomes: plan.course.learningOutcomes,
        whoItsFor: plan.course.whoItsFor,
        includes: plan.course.includes,
        legacy_url: plan.course.legacyUrl ?? null,
        legacy_id: plan.course.legacyId ?? null,
        instructorId: instructor.id,
      },
    });
    courseId = existingCourse.id;
    summary.coursesUpdated = 1;
  } else {
    // Ensure slug uniqueness
    const baseSlug = plan.course.slug || slugify(plan.course.title);
    const taken = await db.course.findUnique({ where: { slug: baseSlug } });
    const finalSlug = taken ? `${baseSlug}-${Date.now()}` : baseSlug;

    const created = await db.course.create({
      data: {
        slug: finalSlug,
        title: plan.course.title,
        subtitle: plan.course.subtitle ?? null,
        description: plan.course.description ?? null,
        status: plan.course.status,
        thumbnailUrl: plan.course.thumbnailUrl ?? null,
        previewVideoUrl: plan.course.previewVideoUrl ?? null,
        learningOutcomes: plan.course.learningOutcomes,
        whoItsFor: plan.course.whoItsFor,
        includes: plan.course.includes,
        legacy_url: plan.course.legacyUrl ?? null,
        legacy_id: plan.course.legacyId ?? null,
        instructorId: instructor.id,
      },
    });
    courseId = created.id;
    summary.coursesCreated = 1;
  }

  // 3. Legacy redirect
  if (plan.course.legacyUrl) {
    const canonicalPath = getCourseUrl(
      existingCourse?.slug ?? plan.course.slug
    );
    try {
      await createRedirect(plan.course.legacyUrl, canonicalPath, true);
      summary.redirectsCreated = 1;
    } catch {
      // Redirect may already exist — not a fatal error
    }
  }

  // 4. Modules + Lessons (idempotent by position)
  for (const mod of plan.modules) {
    let module = await db.module.findFirst({
      where: { courseId, position: mod.position },
    });

    if (module) {
      await db.module.update({
        where: { id: module.id },
        data: { title: mod.title, position: mod.position },
      });
      summary.modulesUpdated++;
    } else {
      module = await db.module.create({
        data: { courseId, title: mod.title, position: mod.position },
      });
      summary.modulesCreated++;
    }

    for (const lesson of mod.lessons) {
      const existingLesson = await db.lesson.findFirst({
        where: { moduleId: module.id, position: lesson.position },
      });

      const lessonData = {
        title: lesson.title,
        type: lesson.type,
        status: lesson.status,
        position: lesson.position,
        videoUrl: lesson.videoUrl ?? null,
        content: lesson.content ?? null,
        downloadUrl: lesson.downloadUrl ?? null,
        drip_days: lesson.drip_days ?? null,
        isPreview: lesson.isPreview,
      };

      if (existingLesson) {
        await db.lesson.update({ where: { id: existingLesson.id }, data: lessonData });
        summary.lessonsUpdated++;
      } else {
        await db.lesson.create({ data: { moduleId: module.id, ...lessonData } });
        summary.lessonsCreated++;
      }
    }
  }

  // 5. Offer + Price
  if (plan.offer && plan.offer.price !== undefined) {
    const existingOffer = await db.offer.findFirst({
      where: { courseId, name: plan.offer.name },
    });

    if (!existingOffer) {
      await db.offer.create({
        data: {
          courseId,
          name: plan.offer.name,
          type: plan.offer.type,
          isActive: true,
          prices: {
            create: {
              amount: plan.offer.price,
              currency: plan.offer.currency,
              isDefault: true,
            },
          },
        },
      });
      summary.offersCreated = 1;
    }
  }

  return summary;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findExistingCourse(slug: string, legacyId?: string) {
  if (legacyId) {
    const byLegacyId = await db.course.findUnique({ where: { legacy_id: legacyId } });
    if (byLegacyId) return byLegacyId;
  }
  return db.course.findUnique({ where: { slug } });
}

async function upsertInstructor(name: string, bio?: string) {
  const existing = await db.instructor.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) return existing;

  return db.instructor.create({
    data: { name, bio: bio ?? null },
  });
}
