import { z } from "zod";

export const schema = z.object({
  dashboardId: z.string(),
  /** The current rank of the dashboard */
  rankingTrending: z.number().nullable(),
  /** Hours this dashboard has spent in the top 8 for the current cycle */
  hoursInTop8: z.number(),
  /** shows historical trend of ranking. Will include missing dates */
  rankingTrend: z.array(z.object({ date: z.date(), rank: z.number() })),
});

export type Top8 = z.infer<typeof schema>;
