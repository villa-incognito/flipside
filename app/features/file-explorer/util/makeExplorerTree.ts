import { WorkItem } from "@fscrypto/domain/src/work-item";
import { arrayToTree } from "performant-array-to-tree";

interface MakeTree {
  workItems: WorkItem[];
  sortBy: SortBy;
  sortDir: SortDir;
}
export const makeExplorerTree = ({ sortBy, sortDir, workItems }: MakeTree) => {
  const { collections, queries, dashboards, visualizations, tempLoaders } = partitionWorkItems(workItems);

  const sortedCollections = sortFileItems(collections, sortDir, sortBy);
  const sortedQueriesAndDashboards = sortQueriesAndDashboards(queries, dashboards, sortDir, sortBy);

  const sortedVisualizations = sortFileItems(visualizations, sortDir, sortBy);
  const items = arrayToTree(
    [...sortedCollections, ...tempLoaders, ...sortedQueriesAndDashboards, ...sortedVisualizations],
    {
      id: "id",
      parentId: "parentId",
      childrenField: "children",
    }
  );
  return items;
};

export type TreeNode = { data: WorkItem; children: TreeNode[] };

export const sortQueriesAndDashboards = (
  queries: WorkItem[],
  dashboards: WorkItem[],
  sortDir: SortDir,
  sortBy: SortBy
): WorkItem[] => {
  return sortFileItems([...queries, ...dashboards], sortDir, sortBy);
};

export const sortFileItems = (items: WorkItem[], sortDirection: "ASC" | "DESC", sortBy: SortBy) => {
  return items.sort((a, b) => dynamicSort(a, b, sortDirection, sortBy));
};

export type SortDir = "ASC" | "DESC";
export type SortBy = "name" | "createdAt" | "updatedAt";

export const dynamicSort = (a: WorkItem, b: WorkItem, sortDir: SortDir, sortBy: SortBy) => {
  if (!a || !b) {
    return -1;
  }
  // this makes sure that the temporary items are always at top bottom of collection
  if (a.id.includes("temporary_create_id")) {
    return -1;
  }
  if (b.id.includes("temporary_create_id")) {
    return 1;
  }
  if (sortBy === "createdAt" || sortBy === "updatedAt") {
    if (a[sortBy] < b[sortBy]) {
      return sortDir === "ASC" ? -1 : 1;
    }
    if (a[sortBy] > b[sortBy]) {
      return sortDir === "ASC" ? 1 : -1;
    }
  }
  if (a[sortBy].toString().toLocaleLowerCase() < b[sortBy].toString().toLocaleLowerCase()) {
    return sortDir === "ASC" ? -1 : 1;
  }
  if (a[sortBy].toString().toLocaleLowerCase() > b[sortBy].toString().toLocaleLowerCase()) {
    return sortDir === "ASC" ? 1 : -1;
  }

  return 0;
};

const partitionWorkItems = (workItems: WorkItem[]) => {
  const queries = [] as WorkItem[];
  const dashboards = [] as WorkItem[];
  const collections = [] as WorkItem[];
  const visualizations = [] as WorkItem[];
  const tempLoaders = [] as WorkItem[];
  workItems.forEach((item) => {
    switch (true) {
      case item.id === "tempLoadingItem":
        tempLoaders.push(item);
        break;
      case item.typename === "collection":
        collections.push(item);
        break;
      case item.typename === "query":
        queries.push(item);
        break;
      case item.typename === "dashboard":
        dashboards.push(item);
        break;
      case item.typename === "visualization":
        visualizations.push(item);
        break;

      default:
        break;
    }
  });
  return { queries, dashboards, collections, visualizations, tempLoaders };
};
