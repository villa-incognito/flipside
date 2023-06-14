import { workItem } from "@fscrypto/domain";
import { WorkItem } from "@fscrypto/domain/src/work-item";
import { $path } from "remix-routes";
import { GET } from "~/async/fetch";

interface SearchWorkItemsParams {
  limit?: number;
  type?: workItem.WorkItemSearchType;
}

export const recentWorkItems = async ({ limit, type = "all" }: SearchWorkItemsParams) => {
  const url = $path("/api/work-items/recent", { limit: limit?.toString() ?? "", type: type ?? "" });
  const { items } = await GET<{ items: WorkItem[] }>(url);
  return items;
};
