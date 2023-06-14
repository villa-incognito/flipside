import { z } from "zod";
import { schema as vizSchema } from "./../visualization";
import { liveQueryProviderTypeSchema } from "../livequery/livequery";

// export const ttlMinutesSchema = z.preprocess((val) => {
//   if (typeof val === "string") return parseInt(val, 10);
//   return val as number;
// }, z.number().min(0).max(24).default(0));

export const queryParamSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.union([z.literal("text"), z.literal("number"), z.literal("date"), z.literal("list"), z.literal("datetime")]),
  value: z.string(),
  queryId: z.string(),
  restrictedValues: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string().uuid().nullable(),
  updatedById: z.string().uuid().nullable(),
});

export const metaSchema = z.object({
  panel: z
    .object({
      verticalRatio: z.tuple([z.number(), z.number()]),
      horizontalRatio: z.tuple([z.number(), z.number()]),
    })
    .optional(),
});

export const schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  slugId: z.string().nullable(),
  latestSlug: z.string().nullable(),
  statement: z.string(),
  ttlMinutes: z.number(),
  lastQueryRunId: z.string().uuid().nullable(),
  lastSuccessfulQueryRunId: z.string().uuid().nullable(),
  queryCollectionId: z.string().uuid().nullable(),
  parentQueryId: z.string().uuid().nullable(),
  resultLastAccessedAt: z.date().nullable(),
  createdById: z.string().uuid(),
  updatedById: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  visualizations: z.array(vizSchema).default([]),
  parameters: z.array(queryParamSchema).default([]),
  meta: metaSchema,
  tables: z.array(z.string()).default([]),
  lastOpenedAt: z.date().nullable(),
  lastSavedAt: z.date().nullable(),
  livequeryProvider: liveQueryProviderTypeSchema.nullable(),
});

export const newSchema = schema.pick({
  name: true,
  queryCollectionId: true,
});

export const updateSchema = schema
  .pick({
    name: true,
    statement: true,
    ttlMinutes: true,
    meta: true,
    lastQueryRunId: true,
    parameters: true,
    lastSuccessfulQueryRunId: true,
    lastSavedAt: true, // Used to prevent stale writes
    livequeryProvider: true,
  })
  .partial();

export const updateSchemaLastAccessedAt = z.object({ resultLastAccessedAt: z.date() });
export const updateSchemaLastQueryRunId = z.object({ lastQueryRunId: z.string() });

export type Query = z.infer<typeof schema>;
export type QueryNew = z.infer<typeof newSchema>;
export type QueryUpdate = z.infer<typeof updateSchema>;
export type QueryUpdateLastAccessedAt = z.infer<typeof updateSchemaLastAccessedAt>;
export type QueryUpdateLastQueryRunId = z.infer<typeof updateSchemaLastQueryRunId>;
export type QueryMeta = z.infer<typeof metaSchema>;
export type QueryParameter = z.infer<typeof queryParamSchema>;
