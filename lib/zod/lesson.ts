import { z } from "zod";

export const CreateLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["VIDEO", "TEXT", "DOWNLOAD", "MIXED"]).default("VIDEO"),
  position: z.number().int().min(0).optional(),
  videoUrl: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  downloadUrl: z.string().nullable().optional(),
  drip_days: z.number().int().min(0).nullable().optional(),
  isPreview: z.boolean().optional().default(false),
});

export const UpdateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["VIDEO", "TEXT", "DOWNLOAD", "MIXED"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  position: z.number().int().min(0).optional(),
  videoUrl: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  downloadUrl: z.string().nullable().optional(),
  drip_days: z.number().int().min(0).nullable().optional(),
  isPreview: z.boolean().optional(),
});

export const ReorderLessonsSchema = z.object({
  lessons: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    })
  ),
});

export type CreateLessonInput = z.infer<typeof CreateLessonSchema>;
export type UpdateLessonInput = z.infer<typeof UpdateLessonSchema>;
export type ReorderLessonsInput = z.infer<typeof ReorderLessonsSchema>;
