import { z } from "zod";

export const CreateCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  instructorId: z.string().min(1, "Instructor is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
});

export const UpdateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  instructorId: z.string().min(1).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  previewVideoUrl: z.string().nullable().optional(),
  learningOutcomes: z.array(z.string()).nullable().optional(),
  whoItsFor: z.array(z.string()).nullable().optional(),
  includes: z.array(z.string()).nullable().optional(),
  legacy_url: z.string().nullable().optional(),
  legacy_id: z.string().nullable().optional(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
