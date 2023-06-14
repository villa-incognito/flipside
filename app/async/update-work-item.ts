import { $path } from "remix-routes";
import { workItem } from "@fscrypto/domain";
import { POST } from "./fetch";

export const updateWorkItem = async ({ name, id, typename }: workItem.WorkItemUpdate) => {
  return POST<{ workItem: workItem.WorkItem }>($path("/api/work-items/update"), { name, id, typename });
};
