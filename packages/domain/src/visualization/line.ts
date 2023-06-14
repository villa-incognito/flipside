import { z } from "zod";
import type { Chart } from "./visualization";
import { schema as xySchema } from "./xy-visualization";
import { schema as scaleSchema } from "./scale";

export const schema = xySchema.merge(
  z.object({
    type: z.literal("line"),
    yAxisValues: z.array(z.string()).default([]),
    yAxisValuesRight: z.array(z.string()).default([]),
    yAxisLabelRight: z.string().optional(),
    yAxisScaleRight: scaleSchema,
    groupByValue: z.string().optional(),
    legacyColorTheme: z.string().optional().default("Default"),
  })
);

export type LineChart = z.infer<typeof schema>;
export const isLineChart = (chart: Chart): chart is LineChart => chart.type === "line";
