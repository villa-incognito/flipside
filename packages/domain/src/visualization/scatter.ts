import { schema as xyVisualizationSchema } from "./xy-visualization";

import { z } from "zod";
import type { Chart } from "./visualization";

export const markerScaleTypeSchema = z
  .union([z.literal("linear"), z.literal("log")])
  .optional()
  .default("linear");

export const schema = xyVisualizationSchema.omit({ yAxisValues: true }).merge(
  z.object({
    type: z.literal("scatter"),
    markerColumn: z.optional(z.string()),
    colorValue: z.optional(z.string()),
    legacyColorTheme: z.string().optional().default("Default"),
    yAxisValue: z.string().optional(),
    markerScaleType: markerScaleTypeSchema,
    markerScaleRange: z.number().optional().default(10),
  })
);

export type ScatterChart = z.infer<typeof schema>;
export const isScatterChart = (chart: Chart): chart is ScatterChart => chart.type === "scatter";
