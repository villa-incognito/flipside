import { WorkItem } from "@fscrypto/domain/src/work-item";
import { GET } from "./fetch";

export const fetchWorkItems = async (parentId?: string | null) => {
  const endpoint = parentId ? `/api/work-items?parentId=${parentId}` : `/api/work-items`;
  const { items } = await GET<{ items: WorkItem[] }>(endpoint);
  return items;
};
