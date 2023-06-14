import { z } from "zod";
import type { Chart } from "./visualization";

export const schema = z.object({
  type: z.literal("big_number"),
  caption: z.string().optional(),
  valueKey: z.string().optional(), // Key in result object to pull value from
  rowNumber: z.number().min(1).optional().default(1), // Row number to pull value from
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  decimals: z.number().min(0).optional().default(1),
  d3Format: z.string().optional(),
  autoFormat: z.boolean().optional().default(true),
});

export type BigNumber = z.infer<typeof schema>;
export const isBigNumber = (chart: Chart): chart is BigNumber => chart.type === "big_number";
