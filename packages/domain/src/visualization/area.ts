import { z } from "zod";
import type { Chart } from "./visualization";
import { schema as xySchema } from "./xy-visualization";

export const schema = xySchema.merge(
  z.object({
    type: z.literal("area"),
    displayType: z.union([z.literal("overlay"), z.literal("stacked")]).default("overlay"),
    normalize: z.boolean().default(false),
    groupByValue: z.string().optional(),
    legacyColorTheme: z.string().optional().default("Default"),
  })
);

export type AreaChart = z.infer<typeof schema>;

export const isAreaChart = (chart: Chart): chart is AreaChart => chart.type === "area";
