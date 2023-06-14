import { z } from "zod";
import { collection, dashboard, query, visualization } from "..";
import { chartTypeSchema, legacyChartTypeSchema } from "../visualization/visualization";

export const workItemTypeSchema = z.union([
  z.literal("collection"),
  z.literal("query"),
  z.literal("dashboard"),
  z.literal("visualization"),
  z.literal("table"),
]);

export const visTypeSchema = z.union([chartTypeSchema, legacyChartTypeSchema]);

export const schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string().optional(),
  parentId: z.string().uuid().nullable(),
  createdById: z.string().uuid().optional(),
  updatedById: z.string().uuid().optional(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  visType: visTypeSchema.optional().nullable(),
  typename: workItemTypeSchema,
  path: z.string().optional().nullable(),
  lastOpenedAt: z.date().optional().nullable(),
});

export const newSchema = schema.pick({
  name: true,
  typename: true,
  parentId: true,
});

export const updateSchema = schema.pick({
  id: true,
  typename: true,
  name: true,
});

export const moveSchema = schema.pick({
  id: true,
  typename: true,
  parentId: true,
});

export const forkSchema = schema.pick({
  id: true,
  typename: true,
  parentId: true,
});

export const deleteSchema = schema.pick({
  id: true,
  typename: true,
});

export type WorkItem = z.infer<typeof schema>;
export type WorkItemNew = z.infer<typeof newSchema>;
export type WorkItemUpdate = z.infer<typeof updateSchema>;
export type WorkItemMove = z.infer<typeof moveSchema>;
export type WorkItemDelete = z.infer<typeof deleteSchema>;
export type WorkItemFork = z.infer<typeof forkSchema>;
export type WorkItemType = z.infer<typeof workItemTypeSchema>;
export type WorkItemSearchType = "all" | "query" | "dashboard" | "visualization";

export const fromCollection = (collection: collection.Collection): WorkItem => {
  return {
    id: collection.id,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    createdById: collection.createdById,
    updatedById: collection.updatedById,
    name: collection.name,
    parentId: collection.parentCollectionId,
    typename: "collection",
    slug: collection.slug,
  };
};

export const fromQuery = (query: query.Query): WorkItem => {
  return {
    id: query.id,
    createdAt: query.createdAt,
    updatedAt: query.updatedAt,
    createdById: query.createdById,
    updatedById: query.updatedById,
    name: query.name,
    parentId: query.queryCollectionId,
    typename: "query",
    slug: query.slug,
  };
};

export const fromDashboard = (dashboard: dashboard.Dashboard): WorkItem => {
  return {
    id: dashboard.id,
    createdAt: dashboard.createdAt,
    updatedAt: dashboard.updatedAt,
    createdById: dashboard.createdById,
    updatedById: dashboard.updatedById,
    name: dashboard.title,
    parentId: dashboard.collectionId,
    typename: "dashboard",
    slug: dashboard.latestSlug,
  };
};

export const fromVisualization = (vis: visualization.Visualization): WorkItem => {
  return {
    id: vis.id,
    createdAt: vis.createdAt,
    updatedAt: vis.updatedAt,
    createdById: vis.createdById,
    updatedById: vis.updatedById,
    name: vis.title,
    parentId: vis.queryId ?? null,
    typename: "visualization",
    slug: vis.id,
  };
};
