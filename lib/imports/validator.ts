import { slugify } from "@/lib/utils";
import { ImportRowSchema } from "@/lib/zod/import-row";
import type { RawCSVRow } from "@/lib/csv/parser";

// ─── Public types ─────────────────────────────────────────────────────────────

export type ImportError = {
  row: number; // 1-based (excludes header)
  field: string;
  message: string;
};

export type LessonPlan = {
  title: string;
  type: "VIDEO" | "TEXT" | "DOWNLOAD" | "MIXED";
  position: number;
  status: "DRAFT" | "PUBLISHED";
  videoUrl?: string;
  content?: string;
  downloadUrl?: string;
  drip_days?: number;
  isPreview: boolean;
};

export type ModulePlan = {
  title: string;
  position: number;
  lessons: LessonPlan[];
};

export type CoursePlan = {
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  learningOutcomes: string[];
  whoItsFor: string[];
  includes: string[];
  legacyUrl?: string;
  legacyId?: string;
  instructorName: string;
  instructorBio?: string;
};

export type OfferPlan = {
  name: string;
  type: "ONE_TIME" | "SUBSCRIPTION" | "PAYMENT_PLAN";
  price?: number;
  currency: string;
};

export type ImportPlan = {
  valid: boolean;
  errors: ImportError[];
  rowCount: number;
  course: CoursePlan;
  modules: ModulePlan[];
  offer?: OfferPlan;
};

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validates all CSV rows and builds a structured ImportPlan.
 * Never writes to the database — purely in-memory validation.
 */
export function validateAndPlan(rawRows: RawCSVRow[]): ImportPlan {
  const errors: ImportError[] = [];

  if (rawRows.length === 0) {
    return {
      valid: false,
      errors: [{ row: 0, field: "file", message: "CSV file is empty" }],
      rowCount: 0,
      course: {} as CoursePlan,
      modules: [],
    };
  }

  // ── Step 1: Row-level Zod validation ────────────────────────────────────────
  type ValidatedRow = ReturnType<(typeof ImportRowSchema)["parse"]>;
  const validRows: Array<{ index: number; data: ValidatedRow }> = [];

  rawRows.forEach((raw, i) => {
    const rowNum = i + 1; // 1-based (header excluded)
    const result = ImportRowSchema.safeParse(raw);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          row: rowNum,
          field: issue.path.join(".") || "unknown",
          message: issue.message,
        });
      }
    } else {
      validRows.push({ index: rowNum, data: result.data });
    }
  });

  // If no rows passed validation, abort early
  if (validRows.length === 0) {
    return { valid: false, errors, rowCount: rawRows.length, course: {} as CoursePlan, modules: [] };
  }

  // ── Step 2: Consistency checks ───────────────────────────────────────────────
  const firstRow = validRows[0].data;
  const expectedTitle = firstRow.course_title;
  const expectedInstructor = firstRow.instructor_name;

  for (const { index, data } of validRows) {
    if (data.course_title !== expectedTitle) {
      errors.push({
        row: index,
        field: "course_title",
        message: `course_title "${data.course_title}" differs from row 1 value "${expectedTitle}". All rows must have the same course_title.`,
      });
    }
    if (data.instructor_name !== expectedInstructor) {
      errors.push({
        row: index,
        field: "instructor_name",
        message: `instructor_name "${data.instructor_name}" differs from row 1 value "${expectedInstructor}".`,
      });
    }
  }

  // ── Step 3: Build module map (keyed by module_position) ─────────────────────
  const moduleMap = new Map<number, { title: string; lessons: Map<number, LessonPlan> }>();

  for (const { index, data } of validRows) {
    const mp = data.module_position;
    const lp = data.lesson_position;

    // Verify module title is consistent for a given position
    const existingModule = moduleMap.get(mp);
    if (existingModule && existingModule.title !== data.module_title) {
      errors.push({
        row: index,
        field: "module_title",
        message: `module_position ${mp} has conflicting titles: "${existingModule.title}" vs "${data.module_title}".`,
      });
      continue;
    }

    if (!existingModule) {
      moduleMap.set(mp, { title: data.module_title, lessons: new Map() });
    }

    const mod = moduleMap.get(mp)!;

    // Check for duplicate lesson positions within this module
    if (mod.lessons.has(lp)) {
      errors.push({
        row: index,
        field: "lesson_position",
        message: `Duplicate lesson_position ${lp} in module_position ${mp}.`,
      });
      continue;
    }

    mod.lessons.set(lp, {
      title: data.lesson_title,
      type: data.lesson_type ?? "VIDEO",
      position: lp,
      status: data.lesson_status ?? "DRAFT",
      videoUrl: data.lesson_video_url || undefined,
      content: data.lesson_content || undefined,
      downloadUrl: data.lesson_download_url || undefined,
      drip_days: data.lesson_drip_days,
      isPreview: data.lesson_is_preview ?? false,
    });
  }

  // ── Step 4: Build sorted modules array ──────────────────────────────────────
  const modules: ModulePlan[] = Array.from(moduleMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([position, { title, lessons }]) => ({
      title,
      position,
      lessons: Array.from(lessons.entries())
        .sort(([a], [b]) => a - b)
        .map(([, lesson]) => lesson),
    }));

  // ── Step 5: Build CoursePlan from first valid row ────────────────────────────
  const r = firstRow;
  const slug = r.course_slug
    ? r.course_slug
    : slugify(r.course_title);

  const course: CoursePlan = {
    title: r.course_title,
    slug,
    subtitle: r.course_subtitle || undefined,
    description: r.course_description || undefined,
    status: r.course_status ?? "DRAFT",
    thumbnailUrl: r.course_thumbnail_url || undefined,
    previewVideoUrl: r.course_preview_video_url || undefined,
    learningOutcomes: r.course_learning_outcomes ?? [],
    whoItsFor: r.course_who_its_for ?? [],
    includes: r.course_includes ?? [],
    legacyUrl: r.course_legacy_url || undefined,
    legacyId: r.course_legacy_id || undefined,
    instructorName: r.instructor_name,
    instructorBio: r.instructor_bio || undefined,
  };

  // ── Step 6: Build OfferPlan if offer columns present ────────────────────────
  let offer: OfferPlan | undefined;
  if (r.offer_price !== undefined || r.offer_name) {
    offer = {
      name: r.offer_name || "Full Access",
      type: r.offer_type ?? "ONE_TIME",
      price: r.offer_price,
      currency: r.offer_currency ?? "USD",
    };
  }

  return {
    valid: errors.length === 0,
    errors,
    rowCount: rawRows.length,
    course,
    modules,
    offer,
  };
}
