import { z } from "zod";

const pathSchema = z
  .string()
  .min(1)
  .startsWith("/", "Path must start with /");

export const CreateRedirectSchema = z.object({
  fromPath: pathSchema,
  toPath: pathSchema,
  isPermanent: z.boolean().optional().default(true),
});

export const UpdateRedirectSchema = z.object({
  toPath: pathSchema.optional(),
  isPermanent: z.boolean().optional(),
});

export type CreateRedirectInput = z.infer<typeof CreateRedirectSchema>;
export type UpdateRedirectInput = z.infer<typeof UpdateRedirectSchema>;
