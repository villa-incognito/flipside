import { WorkItem } from "@fscrypto/domain/src/work-item";
import { $path } from "remix-routes";
import { GET } from "~/async/fetch";

export const getTabs = async () => {
  const { items } = await GET<{ items: WorkItem[] }>($path("/api/work-items/tabs/get"));
  return items;
};
