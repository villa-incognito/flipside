import type { queryRun } from "@fscrypto/domain";

/** this function triggers the query run process by executing a query run using a query statement and id */
export const fetchQueryRunId = async (statement: string, queryId: string) => {
  const url = window.location.protocol + "//" + window.location.host + `/api/queries/${queryId}/execute`;
  try {
    const response = await fetch(url, {
      method: "post",
      body: JSON.stringify({ statement }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 401) window.location.pathname = "/auth/auth0";
    if (!response.ok) {
      const data = await response.json();
      const parsed = JSON.parse(data);
      throw new Error(parsed?.message);
    }
    let data: { result: queryRun.QueryRun } = await response.json();
    return data.result;
  } catch (e) {
    let message = "Failed to fetch query run id";
    if (e instanceof Error) message = e.message;
    throw new Error(message);
  }
};
