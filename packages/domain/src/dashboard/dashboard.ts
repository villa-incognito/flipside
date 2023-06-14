import { z } from "zod";
import { schema as querySchema } from "../query/query";
import { schema as tagSchema } from "../tag/tag";
import { schema as fileUploadSchema } from "../file-upload/file-upload";

const componentTypeSchema = z.union([
  z.literal("Text"),
  z.literal("QueryTable"),
  z.literal("Image"),
  z.literal("QueryVisual"),
  z.literal("Heading"),
]);

const stylesSchema = z.object({
  colorKey: z.string().optional(),
  sizeKey: z.string().optional(),
  hAlignKey: z.string().optional(),
});

export const componentSchema = z.object({
  x: z.number(),
  y: z.number(),
  h: z.number(),
  w: z.number(),
  t: z.string().optional(),
  type: componentTypeSchema,
  format: z.string().optional(),
  i: z.string().optional(),
});

const formulaSchema = z.union([
  z.object({ text: z.string() }),
  z.object({ imageName: z.string() }),
  z.object({ queryId: z.string().uuid() }),
  z.object({ visId: z.string().uuid() }),
  z.object({}),
]);

export const cellSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  formula: formulaSchema.optional(),
  component: componentSchema,
  styles: stylesSchema.optional(),
  i: z.string().optional(),
});

export const tabSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  id: z.string(),
});

export const cellContainerSchema = z.object({
  cells: z.array(cellSchema),
  tabs: z.array(tabSchema).optional(),
});

export const schema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  latestSlug: z.string(),
  collectionId: z.string().uuid().nullable(),
  openGraphImageId: z.string().uuid().nullable(),
  coverImageId: z.string().uuid().nullable(),
  draft: cellContainerSchema,
  published: cellContainerSchema.nullable(),
  description: z.string(),
  slugId: z.string(),
  publishedAt: z.date().nullable(),
  createdById: z.string().uuid(),
  updatedById: z.string().uuid(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  lastRefreshedAt: z.date().nullable(),
  lastOpenedAt: z.date().nullable(),
  forkedFromId: z.string().nullable(),
  queries: z.array(querySchema).default([]),
});

export const newSchema = schema.pick({
  title: true,
  collectionId: true,
  draft: true,
});

export const updateSchema = schema
  .pick({
    title: true,
    draft: true,
    description: true,
    openGraphImageId: true,
    coverImageId: true,
    updatedAt: true,
  })
  .partial();

export const publishedSchema = schema.extend({
  coverImage: fileUploadSchema.optional(),
  tags: z.array(tagSchema).default([]),
});

export const addVizSchema = z.object({
  cell: cellSchema,
});

export type Dashboard = z.infer<typeof schema>;
export type DashboardNew = z.infer<typeof newSchema>;
export type DashboardUpdate = z.infer<typeof updateSchema>;
export type DashboardPublished = z.infer<typeof publishedSchema>;
export type Cell = z.infer<typeof cellSchema>;
export type Component = z.infer<typeof componentSchema>;
export type ComponentType = z.infer<typeof componentTypeSchema>;
export type DashboardTab = z.infer<typeof tabSchema>;
export type Styles = z.infer<typeof stylesSchema>;
