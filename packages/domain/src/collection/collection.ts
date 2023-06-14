import { z } from "zod";

export const schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  parentCollectionId: z.string().uuid().nullable(),
  createdById: z.string().uuid(),
  updatedById: z.string().uuid(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const newSchema = schema.pick({
  name: true,
  parentCollectionId: true,
});

export const updateSchema = newSchema
  .omit({
    parentCollectionId: true,
  })
  .partial();

export type Collection = z.infer<typeof schema>;
export type CollectionNew = z.infer<typeof newSchema>;
export type CollectionUpdate = z.infer<typeof updateSchema>;
