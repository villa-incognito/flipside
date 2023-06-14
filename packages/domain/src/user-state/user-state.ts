import { z } from "zod";

const type = z.union([z.literal("query"), z.literal("dashboard")]);
export const themeSchema = z.union([z.literal("light"), z.literal("dark")]).optional();

export const explorerTabSchema = z.object({
  typeId: z.string(),
  type,
  active: z.boolean().default(false),
});

export const schema = z.object({
  explorerTabs: z.array(explorerTabSchema).default([]),
  theme: themeSchema,
});

export type UserState = z.infer<typeof schema>;
export type UserStateTheme = z.infer<typeof themeSchema>;
export type UserStateExplorerTab = z.infer<typeof explorerTabSchema>;
export type UserStateExplorerTabType = z.infer<typeof type>;
