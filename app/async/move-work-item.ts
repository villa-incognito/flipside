import { $path } from "remix-routes";
import { WorkItemMove } from "@fscrypto/domain/src/work-item";
import { workItem } from "@fscrypto/domain";
import { POST } from "./fetch";

export const moveWorkItem = async ({ id, parentId, typename }: WorkItemMove) => {
  return POST<{ workItem: workItem.WorkItem }>($path("/api/work-items/move"), { id, parentId, typename });
};
