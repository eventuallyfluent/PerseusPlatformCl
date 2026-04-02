import { z } from "zod";

const pipeList = (val: string) =>
  val
    ? val
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const booleanField = z
  .string()
  .optional()
  .transform((v) => {
    if (!v) return false;
    return v.toLowerCase() === "true" || v === "1";
  });

/**
 * Zod schema for a single CSV row.
 * All incoming values are strings (from papaparse); coercion is applied here.
 */
export const ImportRowSchema = z.object({
  // ── Course fields ──────────────────────────────────────────────────────────
  course_title: z.string().min(1, "course_title is required"),
  course_slug: z.string().optional(),
  course_subtitle: z.string().optional(),
  course_description: z.string().optional(),
  course_status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .optional()
    .default("DRAFT"),
  course_legacy_url: z.string().optional(),
  course_legacy_id: z.string().optional(),
  course_thumbnail_url: z.string().optional(),
  course_preview_video_url: z.string().optional(),
  course_learning_outcomes: z
    .string()
    .optional()
    .transform((v) => pipeList(v ?? "")),
  course_who_its_for: z
    .string()
    .optional()
    .transform((v) => pipeList(v ?? "")),
  course_includes: z
    .string()
    .optional()
    .transform((v) => pipeList(v ?? "")),

  // ── Instructor fields ──────────────────────────────────────────────────────
  instructor_name: z.string().min(1, "instructor_name is required"),
  instructor_bio: z.string().optional(),

  // ── Offer fields ───────────────────────────────────────────────────────────
  offer_name: z.string().optional(),
  offer_type: z
    .enum(["ONE_TIME", "SUBSCRIPTION", "PAYMENT_PLAN"])
    .optional()
    .default("ONE_TIME"),
  offer_price: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().min(0).optional()),
  offer_currency: z.string().optional().default("USD"),

  // ── Module fields ──────────────────────────────────────────────────────────
  module_title: z.string().min(1, "module_title is required"),
  module_position: z.coerce
    .number({ invalid_type_error: "module_position must be a number" })
    .int()
    .min(0, "module_position must be ≥ 0"),

  // ── Lesson fields ──────────────────────────────────────────────────────────
  lesson_title: z.string().min(1, "lesson_title is required"),
  lesson_type: z
    .enum(["VIDEO", "TEXT", "DOWNLOAD", "MIXED"])
    .optional()
    .default("VIDEO"),
  lesson_position: z.coerce
    .number({ invalid_type_error: "lesson_position must be a number" })
    .int()
    .min(0, "lesson_position must be ≥ 0"),
  lesson_video_url: z.string().optional(),
  lesson_content: z.string().optional(),
  lesson_download_url: z.string().optional(),
  lesson_drip_days: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(0).optional()),
  lesson_is_preview: booleanField,
  lesson_status: z
    .enum(["DRAFT", "PUBLISHED"])
    .optional()
    .default("DRAFT"),
});

export type ImportRow = z.infer<typeof ImportRowSchema>;
