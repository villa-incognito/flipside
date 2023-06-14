import type { queryRun } from "@fscrypto/domain";

export const cancelRun = async (queryRunId: string) => {
  const url = window.location.protocol + "//" + window.location.host + `/api/query-runs/${queryRunId}/cancel`;
  try {
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Error Cancelling Query Run");
    }
    let data: { result: queryRun.QueryRun } = await response.json();
    return data.result;
  } catch (e) {
    throw new Error("Error Cancelling Query Run");
  }
};
