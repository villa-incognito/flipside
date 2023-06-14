import { z } from "zod";

export const likeableResourceTypeSchema = z.enum(["dashboard"]);

export const schema = z.object({
  id: z.string().uuid(),
  resourceId: z.string().uuid(),
  resourceType: likeableResourceTypeSchema.default("dashboard"),
  createdById: z.string().uuid(),
  updatedById: z.string().uuid(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const dashboardLikes = z.record(z.number());

export type Like = z.infer<typeof schema>;
export type LikeableResourceType = z.infer<typeof likeableResourceTypeSchema>;
export type DashboardLikesType = z.infer<typeof dashboardLikes>;
