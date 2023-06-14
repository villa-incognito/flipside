import { schema as xyVisualizationSchema } from "./xy-visualization";

import { z } from "zod";
import type { Chart } from "./visualization";

export const schema = xyVisualizationSchema.omit({ yAxisRightValue: true }).merge(
  z.object({
    type: z.literal("bar"),
    displayType: z.union([z.literal("grouped"), z.literal("stacked")]).default("stacked"),
    normalize: z.boolean().default(false),
    yAxisValues: z.array(z.string()).default([]),
    yAxisLineValue: z.string().optional(),
    yAxisLinePosition: z.union([z.literal("left"), z.literal("right")]).default("right"),
    groupByValue: z.string().optional(),
    legacyColorTheme: z.string().optional().default("Default"),
  })
);

export type BarChart = z.infer<typeof schema>;
export const isBarChart = (chart: Chart): chart is BarChart => chart.type === "bar";
