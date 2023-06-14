import { schema as xyVisualizationSchema } from "./xy-visualization";

import { z } from "zod";
import type { Chart } from "./visualization";

const seriesConfigSchema = z.object({
  type: z.union([z.literal("bar"), z.literal("line")]),
  axis: z.union([z.literal("left"), z.literal("right")]).default("left"),
  color: z.string().optional(),
  key: z.string(),
});

export const schema = xyVisualizationSchema.merge(
  z.object({
    type: z.literal("bar_line"),
    displayType: z.union([z.literal("grouped"), z.literal("stacked")]).default("stacked"),
    groupByValue: z.string().optional(),
    seriesConfigSchema: z.array(seriesConfigSchema).default([]),
  })
);

export type BarLineLegacyChart = z.infer<typeof schema>;
export const isBarChart = (chart: Chart): chart is BarLineLegacyChart => chart.type === "bar_line";
