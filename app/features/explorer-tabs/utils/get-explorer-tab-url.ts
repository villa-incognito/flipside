import { workItem } from "@fscrypto/domain";
import { $path } from "remix-routes";

export function getExplorerTabUrl(id: string, type: workItem.WorkItemType, search: string = ""): string {
  if (type === "dashboard") {
    return $path("/edit/dashboards/:id", { id: id }, search);
  } else if (type === "query") {
    return $path("/edit/queries/:id", { id: id }, search);
  } else {
    return "/";
  }
}
