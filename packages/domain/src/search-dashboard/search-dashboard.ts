import { boolean, number, z } from "zod";
import { schema as tag } from "../tag";

export const dashboardSchema = z.object({
  id: z.string(),
  content: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  createdById: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  published: boolean().nullable().optional(),
  rankingGreatest: number().nullable().optional(),
  rankingLive: number().nullable().optional(),
  rankingTop: number().nullable().optional(),
  rankingTrending: number().nullable().optional(),
  slug: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  screenshotUrl: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  totalLikes: number().nullable().optional(),
  likedByMe: boolean().nullable().optional(),
  tags: tag.array().nullable().optional(),
});

export const schema = z.object({
  total: number(),
  hits: z.array(
    dashboardSchema
      .omit({ content: true, totalLikes: true, likedByMe: true })
      .extend({ tags: z.string().array().nullable().optional() })
  ),
});

export const searchDashboardQuerySchema = z.object({
  offset: number().optional(),
  pageSize: number().optional(),
  searchTerm: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdById: z.string().optional(),
  dashboardIds: z.array(z.string()).optional(),
  sortBy: z
    .union([z.literal("new"), z.literal("trending"), z.literal("top"), z.literal("greatest"), z.literal("live")])
    .optional(),
});

export const updateDashboardSchema = z.object({
  id: z.string(),
  content: z.string().optional(),
  updated_at: z.string().optional(),
  description: z.string().optional(),
  published: boolean().optional(),
  title: z.string().optional(),
  username: z.string().optional(),
  created_by_id: z.string().optional(),
  slug: z.string().optional(),
  screenshot_url: z.string().optional(),
  avatar_url: z.string().optional(),
});

export type SearchDashboardResult = z.infer<typeof schema>;
export type SearchDashboard = z.infer<typeof dashboardSchema>;
export type SearchDashboardQuery = z.infer<typeof searchDashboardQuerySchema>;
export type UpdateDashboard = z.infer<typeof updateDashboardSchema>;
