import { $path } from "remix-routes";
import { workItem } from "@fscrypto/domain";
import { POST } from "./fetch";

export const deleteWorkItem = async ({ id, typename }: workItem.WorkItemDelete) => {
  return POST<{ items: workItem.WorkItem[] }>($path("/api/work-items/delete"), { id, typename });
};
