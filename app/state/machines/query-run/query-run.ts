import { ActorRefFrom, assign, createMachine, sendParent } from "xstate";
import { queryRun } from "@fscrypto/domain";
import { actorSystem } from "~/state/system";
import type { QueryRunResult } from "~/services/legacy-query-run-service.server";
import invariant from "tiny-invariant";
import { fetchQueryRunId } from "~/features/query/async/fetch-query-run-id";
import { fetchQueryRunData } from "~/features/query/async/fetch-query-run-data";
import { fetchQueryRunResult } from "~/features/query/async/fetch-query-run-result";
import { cancelRun } from "~/features/query/async/cancel-run";
import { useQueryRuns } from "./query-runs";
import { QueryActorRef } from "../query/query";
import { useActorFromSystem } from "~/state/hooks";

interface Context {
  queryRun?: queryRun.QueryRun;
  queryRunResult?: QueryRunResult;
  errorMessage?: string;
}

interface CreateQueryRunMachineProps {
  queryId: string;
  statement?: string;
  queryRun?: queryRun.QueryRun;
  init?: boolean;
  empty?: boolean;
}

export const createQueryRunMachine = ({ queryRun, statement, init, queryId }: CreateQueryRunMachineProps) => {
  const queryRunMachine = createMachine(
    {
      id: "queryRun",
      predictableActionArguments: true,
      tsTypes: {} as import("./query-run.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as QueryRunEvent,
      },
      context: {
        queryRun,
      },
      initial: "initial",
      states: {
        initial: {
          description:
            "The initial state of the machine can be a number of states so we check here to see which one we should start with",
          always: [
            {
              target: "executeQuery",
              cond: "initOnCreation",
            },
            {
              target: "pollingResults",
              cond: "isRunningOrQueued",
            },
            {
              target: "fetchResults",
              cond: "isFinished",
            },
            {
              target: "error.pollingResults",
              cond: "isError",
            },
            {
              target: "idle",
            },
          ],
        },
        idle: {
          on: {
            "QUERY_RUN.RUN_QUERY": {
              target: "waitForExecute",
            },
          },
        },
        waitForExecute: {
          description:
            "the query run has been requested to run but we need to make sure any debounced queries have updated first",
          after: {
            500: "executeQuery",
          },
        },
        executeQuery: {
          description: "this is where we first initiate the query run process",
          invoke: {
            id: "executeQuery",
            src: "executeQuery",
            onDone: {
              target: "pollingResults",
              actions: ["setData"],
            },
            onError: {
              target: "error.executingQuery",
              actions: ["setErrorMessage"],
            },
          },
          entry: ["informParentQueryRunHasExecuted"],
        },
        pollingResults: {
          description:
            "this will periodically poll the server for the results of the query run. The results will stop polling when the query run is finished and the results are in S3",
          invoke: {
            id: "pollingResults",
            src: "pollingResults",
            onDone: [
              {
                target: "fetchResults",
                cond: "resultSuccess",
                actions: ["setData", "sendSuccess"],
              },
              {
                target: "error.pollingResults",
                cond: "resultFailed",
                actions: ["setData"],
              },
              {
                target: "cancelled",
                cond: "resultCanceled",
                actions: ["setData"],
              },
              {
                target: "waiting",
                actions: ["setData"],
              },
            ],
          },
          on: {
            "QUERY_RUN.CANCEL_RUN": {
              target: "cancelling",
            },
          },
          entry: ["informParentQueryRunIsPolling"],
        },
        fetchResults: {
          description: "this stage will fetch the latest results formatted for the UI",
          invoke: {
            id: "fetchResults",
            src: "fetchResults",
            onDone: {
              target: "complete",
              actions: ["setResult"],
            },
            onError: {
              target: "error.fetchingResults",
              // actions: ["setResult"],
            },
          },
        },
        cancelling: {
          description: "this stage will cancel the query run. This will only work if the query run is still running",
          invoke: {
            id: "cancelRun",
            src: "cancelRun",
            onDone: [
              {
                description: "we still check for results here as canceling may be too late to cancel",
                target: "fetchResults",
                cond: "resultSuccess",
                actions: ["setData", "sendSuccess"],
              },
              {
                target: "cancelled",
                cond: "resultCanceled",
                actions: ["setData"],
              },
              {
                target: "waitingForCancel",
                actions: ["setData"],
              },
            ],
            onError: {
              target: "error.cancelling",
            },
          },
        },
        cancelled: {
          on: {
            "QUERY_RUN.RUN_QUERY": {
              target: "waitForExecute",
            },
          },
          after: {
            2000: {
              target: "idle",
            },
          },
        },
        error: {
          on: {
            "QUERY_RUN.RUN_QUERY": {
              target: "waitForExecute",
            },
          },
          states: {
            executingQuery: {},
            pollingResults: {},
            fetchingResults: {},
            cancelling: {},
          },
        },
        complete: {
          on: {
            "QUERY_RUN.RUN_QUERY": {
              target: "waitForExecute",
            },
          },
          entry: ["informParentQueryRunHasFinished"],
        },
        waiting: {
          after: {
            1000: {
              target: "pollingResults",
            },
          },
          on: {
            "QUERY_RUN.CANCEL_RUN": {
              target: "cancelling",
            },
          },
        },
        waitingForCancel: {
          after: {
            1000: {
              target: "cancelling",
            },
          },
        },
      },
    },
    {
      actions: {
        setData: assign((context, event) => {
          return {
            queryRun: event.data,
          };
        }),
        setResult: assign((context, event) => {
          return {
            queryRunResult: event.data,
          };
        }),
        setErrorMessage: assign((context, event) => {
          return {
            errorMessage: event.data.message,
          };
        }),
        informParentQueryRunHasExecuted: sendParent((_) => {
          return {
            type: "QUERY_RUN_EXECUTED",
            queryId,
          };
        }),
        informParentQueryRunIsPolling: sendParent((_) => {
          return {
            type: "QUERY_RUN_POLLING",
            queryId,
          };
        }),
        informParentQueryRunHasFinished: sendParent((_) => {
          return {
            type: "QUERY_RUN_FINISHED",
            queryId,
          };
        }),
      },
      services: {
        executeQuery: async (_) => fetchQueryRunId(statement!, queryId),
        pollingResults: async (context) => {
          invariant(context.queryRun, "queryRun needed to poll results");
          return fetchQueryRunData(context.queryRun.id);
        },
        fetchResults: async (_) => fetchQueryRunResult(queryId),
        cancelRun: async (context) => cancelRun(context.queryRun?.id!),
      },
      guards: {
        initOnCreation: () => init ?? false,
        isRunningOrQueued: (context) => context.queryRun?.status === "running" || context.queryRun?.status === "queued",
        isFinished: (context) => context.queryRun?.status === "finished" && !!context.queryRun.s3Results,
        isError: (context) => context.queryRun?.status === "failed",
        resultSuccess: (context, event) => !!event.data.s3Results,
        resultFailed: (context, event) => event.data.status === "failed",
        resultCanceled: (context, event) => event.data.status === "canceled",
      },
    }
  );

  return queryRunMachine;
};

export type QueryRunActorRef = ActorRefFrom<ReturnType<typeof createQueryRunMachine>>;

type State = NonNullable<ReturnType<QueryRunActorRef["getSnapshot"]>>;
const queryRunSelector = (state: State) => state.context.queryRun;
const queryResultsSelector = (state: State) => state.context.queryRunResult;
const isCompleteSelector = (state: State) => state.matches("complete") || state.matches("idle");
const hasErrorSelector = (state: State) => state.matches("error");
const isCancelledSelector = (state: State) => state.matches("cancelled");
const isCancellingSelector = (state: State) => state.matches("cancelling");
const isIdleSelector = (state: State) => state.matches("idle");
const errorMessageSelector = (state: State) => state.context.queryRun?.message ?? state.context.errorMessage;
const canRunQuerySelector = (state: State) =>
  state.matches("idle") || state.matches("cancelled") || state.matches("error") || state.matches("complete");
const canCancelSelector = (state: State) => state.matches("pollingResults") || state.matches("waiting");
const cantCancelSelector = (state: State) =>
  state.matches("fetchResults") || state.matches("executeQuery") || state.matches("cancelling");

const isInprogressSelector = (state: State) =>
  state.matches("pollingResults") || state.matches("waiting") || state.matches("fetchResults");

export type QueryRun = {
  value?: queryRun.QueryRun;
  results?: QueryRunResult;
  isInProgress: boolean;
  isComplete: boolean;
  hasError: boolean;
  isCancelled: boolean;
  isCancelling: boolean;
  isIdle: boolean;
  errorMessage?: string;
  canRunQuery: boolean;
  canCancelQuery: boolean;
  cantCancelQuery: boolean;
  cancelRun: () => void;
  setRealtimeActive: () => void;
};

export const useQueryRunByQueryId = (queryId: string) => {
  const { byQueryId } = useQueryRuns();
  const refForQuery = byQueryId[queryId];
  const [state, ref] = useActorFromSystem<QueryRunActorRef>(`queryRun-${refForQuery?.id}`);
  if (!state || !ref) return null;
  const { send } = ref;
  const queryRun = queryRunSelector(state);
  const queryRunResult = queryResultsSelector(state);
  const isInProgress = isInprogressSelector(state);
  const isComplete = isCompleteSelector(state);
  const hasError = hasErrorSelector(state);
  const isCancelled = isCancelledSelector(state);
  const isCancelling = isCancellingSelector(state);
  const isIdle = isIdleSelector(state);
  const errorMessage = errorMessageSelector(state);
  const canRunQuery = canRunQuerySelector(state);
  const canCancelQuery = canCancelSelector(state);
  const cantCancelQuery = cantCancelSelector(state);
  const cancelRun = () => {
    send({ type: "QUERY_RUN.CANCEL_RUN" });
  };

  const setRealtimeActive = () => {
    const ref = actorSystem.get<QueryActorRef>(`query-${queryId}`)?.getSnapshot()?.context.resultsPanelRef;
    ref?.send({ type: "SET_REALTIME_ACTIVE" });
  };

  if (!refForQuery) {
    return undefined;
  }
  return {
    value: queryRun,
    results: queryRunResult,
    isCancelled,
    isInProgress,
    isComplete,
    hasError,
    isCancelling,
    isIdle,
    errorMessage,
    canRunQuery,
    canCancelQuery,
    cantCancelQuery,
    cancelRun,
    setRealtimeActive,
  };
};

type QueryRunEvent =
  | {
      type: "done.invoke.executeQuery";
      data: queryRun.QueryRun;
    }
  | {
      type: "error.platform.executeQuery";
      data: Error;
    }
  | {
      type: "done.invoke.pollingResults";
      data: queryRun.QueryRun;
    }
  | {
      type: "done.invoke.fetchResults";
      data: QueryRunResult;
    }
  | {
      type: "done.invoke.cancelRun";
      data: queryRun.QueryRun;
    }
  | {
      type: "QUERY_RUN.CANCEL_RUN";
    }
  | {
      type: "QUERY_RUN.RUN_QUERY";
    }
  | {
      type: "QUERY_RUN.UPDATE_STATEMENT";
      statement: string;
    };

export type GlobalQueryRunEvent = {
  type: "QUERY_RUN.BROADCAST_RESULT";
  queryRunResult: QueryRunResult;
  queryId: string;
};
