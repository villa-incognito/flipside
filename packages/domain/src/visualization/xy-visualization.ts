import { schema as scaleSchema } from "./scale";
import { schema as dataTypeSchema } from "./data-type";
import { z } from "zod";

export const schema = z.object({
  xAxisValue: z.optional(z.string()),
  xAxisLabel: z.optional(z.string()),
  xAxisScale: scaleSchema.default("auto"),
  xAxisType: dataTypeSchema.default("auto"),
  xAxisSortKey: z.optional(z.string()),
  xAxisSortDirection: z.union([z.literal("asc"), z.literal("desc"), z.literal("none")]).default("asc"),
  yAxisValues: z.optional(z.array(z.string())).default([]),
  yAxisLabel: z.optional(z.string()),
  yAxisScale: scaleSchema.default("auto"),
  yAxisType: dataTypeSchema.default("auto"),
  yAxisRightValue: z.optional(z.string()),
  yAxisRightLabel: z.optional(z.string()),
  yAxisRightScale: z.optional(scaleSchema),
  yAxisRightType: z.optional(dataTypeSchema),
  maximumCategories: z.optional(z.number()).default(8),
  lineGap: z.union([z.literal("none"), z.literal("nulls"), z.literal("zeros")]).default("none"),
});

export type XYVisualization = z.infer<typeof schema>;
