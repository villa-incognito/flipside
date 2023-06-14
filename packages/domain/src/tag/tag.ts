import { z } from "zod";

export const tagTypes = z.enum(["flipside-tag", "project"]);
export const redisPrefix = "snowflake:tags";

export const schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string().nullable(),
  featured: z.boolean().default(false),
  iconFileName: z.string().nullable(),
  sortOrder: z.number().nullable(),
  type: tagTypes.default("flipside-tag"),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export type Tag = z.infer<typeof schema>;
export type TagType = z.infer<typeof tagTypes>;
