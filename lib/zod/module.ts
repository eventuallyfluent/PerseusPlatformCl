import { z } from "zod";

export const CreateModuleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  position: z.number().int().min(0).optional(),
});

export const UpdateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  position: z.number().int().min(0).optional(),
});

export const ReorderModulesSchema = z.object({
  modules: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    })
  ),
});

export type CreateModuleInput = z.infer<typeof CreateModuleSchema>;
export type UpdateModuleInput = z.infer<typeof UpdateModuleSchema>;
export type ReorderModulesInput = z.infer<typeof ReorderModulesSchema>;
