import { workItem } from "@fscrypto/domain";
import { WorkItem } from "@fscrypto/domain/src/work-item";
import { $path } from "remix-routes";

interface SearchWorkItemsParams {
  term?: string;
  type?: workItem.WorkItemSearchType;
}

export const searchWorkItems = async ({ term, type }: SearchWorkItemsParams) => {
  //   const endpoint = parentId ? `/api/work-items?parentId=${parentId}` : `/api/work-items`;
  const url =
    window.location.protocol +
    "//" +
    window.location.host +
    $path("/api/work-items/search", { term: term ?? "", type: type ?? "" });
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error Fetching Preview");
    }
    let data: { items: WorkItem[] } = await response.json();
    return data.items;
  } catch (e) {
    throw new Error("Error Fetching Preview");
  }
};
