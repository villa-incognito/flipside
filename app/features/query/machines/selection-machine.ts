import { useActor } from "@xstate/react";
import { ActorRefFrom, StateFrom, assign } from "xstate";
import { createMachine } from "xstate";
import { ephemeralQueryMachine } from "~/features/dashboard/dashboard-grid/ephemeralQueryMachine";
import { QueryRunResult } from "~/services/legacy-query-run-service.server";
import { actorSystem } from "~/state";
import { EditorParam } from "../utils/get-parameters-from-statement";
import { QueryActorRef } from "~/state/machines";

export const createQuerySelectionMachine = ({ queryId }: { queryId: string }) => {
  const machine = createMachine(
    {
      id: `query-selection`,
      tsTypes: {} as import("./selection-machine.typegen").Typegen0,
      schema: {
        context: {} as QueryStatementContext,
        events: {} as QueryEvents,
      },
      context: {
        selection: "",
      },
      initial: "idle",
      on: {
        CLEAR_SELECTION: {
          actions: ["clearSelection", "setRealtimeModeActive"],
        },
      },
      states: {
        idle: {
          id: "idle",
          on: {
            "SELECTION.UPDATE": {
              actions: "updateSelection",
            },
            "SELECTION.RUN_SELECTION": {
              target: "fetchingEphemeralQuery",
              actions: ["setSavedSelection", "setSelectionModeActive"],
            },
          },
        },
        success: {},
        error: {
          on: {
            "SELECTION.RUN_SELECTION": {
              target: ["fetchingEphemeralQuery"],
            },
          },
        },
        fetchingEphemeralQuery: {
          id: "fetchingEphemeralQuery",
          invoke: {
            id: "fetchEphemeralQuery",
            src: ephemeralQueryMachine,
            autoForward: true,
            data: (context) => {
              const ref = actorSystem.get<QueryActorRef>(`query-${queryId}`)!;
              const currentParameters = (ref.getSnapshot()?.context.parametersRef?.getSnapshot()?.context.parameters ??
                []) as EditorParam[];
              return {
                queryId: queryId,
                parameters: currentParameters,
                statement: context.selection,
              };
            },
            onDone: {
              target: "#success",
              actions: ["setSelectionRunData"],
            },
            onError: {
              target: "error",
            },
          },
          initial: "executingQuery",
          states: {
            executingQuery: {
              on: {
                POLLING_QUERY: "polling",
              },
            },
            polling: {},
            success: {
              id: "success",
              type: "final",
              always: {
                target: "#idle",
              },
            },
          },
        },
      },
    },
    {
      actions: {
        setSavedSelection: assign((context) => {
          return {
            startTime: new Date(),
            savedSelection: context.selection,
          };
        }),
        updateSelection: assign((context, event) => {
          return {
            selection: event.payload,
          };
        }),
        setSelectionRunData: assign((context, event) => {
          return {
            selectionRunData: event.data,
          };
        }),
        clearSelection: assign((_) => {
          return {
            savedSelection: undefined,
            startTime: undefined,
          };
        }),
        setSelectionModeActive: (_) => {
          const ref = actorSystem.get<QueryActorRef>(`query-${queryId}`)?.getSnapshot()?.context.resultsPanelRef;
          ref?.send({ type: "SET_SELECTION_ACTIVE" });
        },
        setRealtimeModeActive: (_) => {
          const ref = actorSystem.get<QueryActorRef>(`query-${queryId}`)?.getSnapshot()?.context.resultsPanelRef;
          ref?.send({ type: "SET_REALTIME_ACTIVE" });
        },
      },
    }
  );
  return machine;
};

type QueryStatementContext = {
  selection: string;
  startTime?: Date;
  savedSelection?: string;
  selectionRunData?: QueryRunResult;
};

type QueryEvents =
  | { type: "done.invoke.fetchEphemeralQuery"; data: QueryRunResult }
  | { type: "SELECTION.UPDATE"; payload: string }
  | { type: "SELECTION.RUN_SELECTION" }
  | { type: "POLLING_QUERY" }
  | { type: "CLEAR_SELECTION" };

export type QuerySelectionRef = ActorRefFrom<ReturnType<typeof createQuerySelectionMachine>>;
export type QuerySelectionState = StateFrom<ReturnType<typeof createQuerySelectionMachine>>;

export const useSelectionMachine = (queryId: string) => {
  const ref = actorSystem.get<QueryActorRef>(`query-${queryId}`)!;
  const statementRef = ref.getSnapshot()?.context.selectionRef;
  const [state, send] = useActor(statementRef!);
  return {
    selectionRunData: state.context.selectionRunData,
    canRunQuery: state.matches("idle") || state.matches("error"),
    runSelection: () => send({ type: "SELECTION.RUN_SELECTION" }),
    clearSelection: () => send({ type: "CLEAR_SELECTION" }),
    isFetching: state.matches("fetchingEphemeralQuery"),
    isExecuting: state.matches("fetchingEphemeralQuery.executingQuery"),
    isPolling: state.matches("fetchingEphemeralQuery.polling"),
    hasError: state.matches("error"),
    startTime: state.context.startTime,
    savedSelection: state.context.savedSelection,
    setSelectionActive: () => ref.getSnapshot()?.context.resultsPanelRef?.send({ type: "SET_SELECTION_ACTIVE" }),
  };
};
