import { $path } from "remix-routes";
import { Query } from "@fscrypto/domain/src/query";
import { Visualization } from "@fscrypto/domain/src/visualization";
import { Dashboard } from "@fscrypto/domain/src/dashboard";
import { Collection } from "@fscrypto/domain/src/collection";
import { workItem } from "@fscrypto/domain";
import { POST } from "./fetch";

export const createWorkItem = async ({ name, parentId, typename }: workItem.WorkItemNew) => {
  return POST<CreateWorkItemResponse>($path("/api/work-items/create"), { name, parentId, typename });
};

export type CreateWorkItemResponse = {
  workItem: workItem.WorkItem;
  query?: Query;
  visualization?: Visualization;
  dashboard?: Dashboard;
  collection?: Collection;
};
