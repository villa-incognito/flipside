import { $path } from "remix-routes";
import { workItem } from "@fscrypto/domain";
import { POST } from "./fetch";

export const forkWorkItem = async ({ id, parentId, typename }: workItem.WorkItemFork) => {
  return POST<ForkedWorkItemResponse>($path("/api/work-items/fork"), { id, parentId, typename });
};

export type ForkedWorkItemResponse = {
  workItem: workItem.WorkItem;
};
