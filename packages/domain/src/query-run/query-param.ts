import { z } from "zod";

export const queryParamSchema = z.object({
  id: z.string().uuid(),
  queryId: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  value: z.string(),
  restrictedValues: z.string().optional(),
});

export const newQueryParamSchema = queryParamSchema.pick({
  name: true,
  type: true,
  value: true,
  restrictedValues: true,
});

export const newQueryParamsSchema = z.array(newQueryParamSchema);

export type QueryParam = z.infer<typeof queryParamSchema>;
export type QueryParamsNew = z.infer<typeof newQueryParamsSchema>;
