import type { QueryRunResult } from "~/services/legacy-query-run-service.server";

export const fetchQueryRunResult = async (queryId: string) => {
  const url = window.location.protocol + "//" + window.location.host + `/api/queries/${queryId}/latest-run`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error Fetching Latest Run: ${response.status} ${response.statusText}`);
    }
    let data: QueryRunResult = await response.json();
    return data;
  } catch (e) {
    throw new Error(`Error Fetching Latest Run: ${e}`);
  }
};
