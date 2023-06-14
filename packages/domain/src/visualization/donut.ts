import { z } from "zod";
import type { Chart } from "./visualization";

export const labelOptionSchema = z.union([
  z.literal("label"),
  z.literal("labelAndValue"),
  z.literal("percent"),
  z.literal("valueAndPercent"),
  z.literal("labelAndPercent"),
]);
export const holeSizeSchema = z.union([z.literal("0%"), z.literal("25%"), z.literal("50%"), z.literal("75%")]);

export const schema = z.object({
  type: z.literal("donut"),
  labelKey: z.string().optional(),
  valueKey: z.string().optional(),
  maxSlices: z.number().min(2).max(10).optional().nullable().default(null),
  hasOtherSlice: z.boolean().optional().default(false),
  holeSize: holeSizeSchema.optional().default("50%"),
  labelOption: labelOptionSchema.optional().default("labelAndValue"),
  groupAdditionalSlices: z.boolean().optional().default(false),
  maximumCategories: z.optional(z.number()).default(8),
});

export type Donut = z.infer<typeof schema>;
export const isDonutChart = (chart: Chart): chart is Donut => chart.type === "donut";
