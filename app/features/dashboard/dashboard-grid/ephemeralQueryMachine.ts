import { createMachine, assign, sendParent } from "xstate";
import { CustomParameter, isCustomParameter } from "../dashboard-parameters/dashboard-parameters.machine";
import type { QueryRunResult } from "~/services/legacy-query-run-service.server";
import { convertParamsWithCommas } from "~/features/query/utils/convert-params-with-commas";
import { resetTableState } from "~/features/query/machines/table-state-machine";

export const ephemeralQueryMachine = createMachine(
  {
    predictableActionArguments: true,
    id: `dashboardEphemeralQuery`,
    tsTypes: {} as import("./ephemeralQueryMachine.typegen").Typegen0,
    schema: {
      context: {} as EphemeralQueryContext,
      events: {} as EphemeralQueryEvent,
    },
    initial: "executeQuery",
    on: {
      CLEAR_SELECTION: {
        target: "#canceled",
      },
    },
    states: {
      executeQuery: {
        invoke: {
          id: "executeQuery",
          src: "executeQuery",
          onDone: {
            target: "polling",
            actions: ["setToken", "sendPolling"],
          },
          onError: {
            target: "#error",
          },
        },
      },
      polling: {
        invoke: {
          id: "fetchresults",
          src: "fetchResults",
          onDone: [
            {
              target: "#success",
              cond: "resultSuccess",
              actions: ["setResult", "sendSuccess"],
            },
            {
              target: "#error",
              cond: "resultFail",
              actions: ["setResult", "sendError"],
            },
            {
              target: "idle",
            },
          ],
          onError: {
            target: "#error",
          },
        },
        entry: ["sendPolling"],
      },
      idle: {
        after: {
          3000: {
            target: "polling",
            actions: ["sendPolling"],
          },
        },
      },
      success: {
        id: "success",
        type: "final",
        data: (context) => {
          return context.result;
        },
      },
      canceled: {
        id: "canceled",
        type: "final",
      },
      error: {
        id: "error",
        type: "final",
        data: (context) => {
          return context.result;
        },
      },
    },
  },
  {
    actions: {
      sendError: sendParent((context, event) => {
        return {
          type: "EPHEMERAL_RUN_ERROR",
          data: event.data,
        };
      }),
      setResult: assign((context, event) => {
        return { result: event.data };
      }),
      setToken: assign((context, event) => {
        return { token: event.data };
      }),
      sendSuccess: sendParent((context, event) => {
        return {
          type: "QUERY_SUCCESS",
          data: event.data,
        };
      }),
      sendPolling: sendParent(() => {
        return {
          type: "POLLING_QUERY",
        };
      }),
    },
    services: {
      executeQuery: async (context) => {
        resetTableState(context.queryId, "selection");
        const url =
          window.location.protocol + "//" + window.location.host + `/api/queries/${context.queryId}/ephemeral/execute`;
        const parameters = convertParamsWithCommas(context.parameters ?? []);
        const response = await fetch(url, {
          method: "post",
          body: JSON.stringify({
            statement: context.statement,
            parameters: (parameters ?? []).map((param) => ({
              name: param.name,
              value: isCustomParameter(param) ? param.customValue : param.value,
              type: param.type,
            })),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data);
          throw new Error(parsed?.message);
        }
        let data: { result: { token: string } } = await response.json();
        return data.result.token;
      },
      fetchResults: async (context) => {
        const url =
          window.location.protocol + "//" + window.location.host + `/api/query-runs/ephemeral/${context.token}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error Fetching Query Run Data: ${response.status} ${response.statusText}`);
        }
        let data: QueryRunResult = await response.json();
        return data;
      },
    },
    guards: {
      resultSuccess: (context, event) => {
        return event.data.status === "finished";
      },
      resultFail: (context, event) => {
        return event.data.status === "failed";
      },
    },
  }
);

interface EphemeralQueryContext {
  queryId: string;
  statement: string;
  parameters?: CustomParameter[];
  token?: string;
  result?: QueryRunResult;
}

type EphemeralQueryEvent =
  | {
      type: "done.invoke.executeQuery";
      data: string;
    }
  | {
      type: "done.invoke.fetchresults";
      data: QueryRunResult;
    }
  | {
      type: "error.platform.execute";
    }
  | {
      type: "CLEAR_SELECTION";
    };
