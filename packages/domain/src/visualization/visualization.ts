import { z } from "zod";
import { schema as areaChartSchema } from "./area";
import { schema as barChartSchema } from "./bar";
import { schema as lineChartSchema } from "./line";
import { schema as legendSchema } from "./legend";
import { schema as scatterChartSchema } from "./scatter";
import { schema as bigNumberSchema } from "./big-number";
import { schema as donutSchema } from "./donut";
import { schema as legacyBarLineSchema } from "./legacy-bar-line";

/*********************************************************************
 * Visualization Types
 *********************************************************************/
export const chartSchema = z.discriminatedUnion("type", [
  areaChartSchema,
  barChartSchema,
  lineChartSchema,
  scatterChartSchema,
  bigNumberSchema,
  donutSchema,
  legacyBarLineSchema,
]);

export type Chart = z.infer<typeof chartSchema>;

const date = z.preprocess((arg) => {
  if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
}, z.date().default(new Date()));
export const legacyOptionsSchema = z.record(z.string(), z.any());

export const chartTypeSchema = z.union([
  z.literal("donut"),
  z.literal("big_number"),
  z.literal("area"),
  z.literal("line"),
  z.literal("bar"),
  z.literal("scatter"),
  z.literal("bar_line"),
]);

export const legacyChartTypeSchema = z.union([
  z.literal("donut"),
  z.literal("big_number"),
  z.literal("area"),
  z.literal("line2"),
  z.literal("bar2"),
  z.literal("scatter"),
  z.literal("multi"),
]);

export const schema = z.object({
  id: z.string(),
  legacyOptions: legacyOptionsSchema.default({}),
  legacyType: legacyChartTypeSchema.default("bar2"),
  chart: chartSchema.default(barChartSchema.parse({ type: "bar" })),
  version: z.string().default("2"),
  title: z.string().default("Untitled Chart"),
  legend: legendSchema.default({ show: true, position: "right" }),
  createdById: z.string().uuid(),
  updatedById: z.string().uuid(),
  createdAt: date,
  updatedAt: date,
  chartType: chartTypeSchema.default("bar"),
  queryId: z.string().uuid().optional(),
});

export const newSchema = schema.pick({
  chart: true,
  version: true,
  title: true,
  legend: true,
  queryId: true,
});

export const updateSchema = newSchema.partial();

export type Visualization = z.infer<typeof schema>;
export type VisualizationNew = z.infer<typeof newSchema>;
export type VisualizationUpdate = z.infer<typeof updateSchema>;
export type VisualizationType = z.infer<typeof chartSchema>["type"];
export type VisualizationLegend = z.infer<typeof legendSchema>;
export type VisualizationLegacyOptions = z.infer<typeof legacyOptionsSchema>;
export type VisualizationLegacyType = z.infer<typeof legacyChartTypeSchema>;
