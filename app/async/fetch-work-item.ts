import { WorkItem } from "@fscrypto/domain/src/work-item";
import { GET } from "./fetch";

export const fetchWorkItem = async (parentId?: string | null) => {
  const endpoint = `/api/work-items/${parentId}`;
  const { item } = await GET<{ item: WorkItem }>(endpoint);
  return item;
};
