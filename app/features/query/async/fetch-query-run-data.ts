import type { queryRun } from "@fscrypto/domain";

export const fetchQueryRunData = async (queryRunId: string) => {
  const url = window.location.protocol + "//" + window.location.host + `/api/query-runs/${queryRunId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error Fetching Query Run Data: ${response.status} ${response.statusText}`);
    }
    let data: queryRun.QueryRun = await response.json();
    return data;
  } catch (e) {
    throw new Error(`Error Fetching Query Run Data: ${e}`);
  }
};
