import { z } from "zod";
import { newQueryParamsSchema } from "./query-param";

export const queryStatusSchema = z.enum(["canceled", "failed", "queued", "running", "finished"]);
export const executionTypeSchema = z.enum(["REALTIME", "REFRESH", "EPHEMERAL", "PREVIEW", "SELECT_AND_RUN", "API"]);
export const userTierSchema = z.enum(["community", "builder"]);

export const queryRunSnowflakeTagSchema = z.object({
  apiKey: z.string().nullable().optional(),
  dashboardId: z.string().nullable().optional(),
  parameterized: z.boolean().nullable().optional(),
  queryId: z.string().nullable().optional(),
  type: executionTypeSchema.nullable().optional(),
  sdkPackage: z.string().nullable().optional(),
  sdkVersion: z.string().nullable().optional(),
  ttlMinutes: z.number().nullable().optional(),
  userId: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  userTier: userTierSchema.nullable().optional(),
  livequeryProvider: z.string().nullable().optional(),
});

export const queryRunSchema = z.object({
  id: z.string().uuid(),
  status: queryStatusSchema,
  queryId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  snowflakeRole: z.string(),
  executionType: executionTypeSchema,
  columnLabels: z.array(z.string()).nullable(),
  columnTypes: z.array(z.string()).nullable(),
  message: z.string().nullable(),
  rowCount: z.number().nullable(),
  startedAt: z.date().nullable(),
  endedAt: z.date().nullable(),
  createdById: z.string().uuid().nullable(),
  snowflakeQueryId: z.string().nullable(),
  statement: z.string().nullable(),
  updatedById: z.string().uuid().nullable(),
  snowflakeSessionId: z.string().nullable(),
  s3Results: z.boolean().nullable(),
  snowflakeTag: queryRunSnowflakeTagSchema.nullable(),
});

export const newQueryRunSchema = z.object({
  statement: z.string(),
  userId: z.string().uuid(),
  executionType: executionTypeSchema,
  queryId: z.string().uuid().optional(),
  queryParams: newQueryParamsSchema.optional(),
  snowflakeTag: queryRunSnowflakeTagSchema.nullable().optional(),
});

export const updateQueryRunSchema = z
  .object({
    status: queryStatusSchema,
    endedAt: z.date(),
    message: z.string(),
    snowflakeQueryId: z.string(),
    snowflakeSessionId: z.string(),
    columnLabels: z.array(z.string()),
    columnTypes: z.array(z.string()),
    rowCount: z.number(),
    snowflakeRole: z.string(),
  })
  .partial();

export type QueryRunStatus = z.infer<typeof queryStatusSchema>;
export type ExecutionType = z.infer<typeof executionTypeSchema>;
export type QueryRun = z.infer<typeof queryRunSchema>;
export type QueryRunNew = z.infer<typeof newQueryRunSchema>;
export type QueryRunUpdate = z.infer<typeof updateQueryRunSchema>;
export type QueryRunSnowflakeTag = z.infer<typeof queryRunSnowflakeTagSchema>;
