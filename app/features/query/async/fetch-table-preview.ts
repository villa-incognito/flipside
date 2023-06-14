import type { QueryRunResult } from "~/services/legacy-query-run-service.server";

export const fetchTablePreview = async (table: string) => {
  const url = window.location.protocol + "//" + window.location.host + `/api/schemas/preview/${table}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error Fetching Preview");
    }
    let data: QueryRunResult = await response.json();
    return data;
  } catch (e) {
    throw new Error("Error Fetching Preview");
  }
};
