import { ActorRefFrom, StateFrom, assign, spawn, createMachine, toActorRef } from "xstate";
import { TablePreviewRef, createTablePreviewMachine } from "./table-preview-machine";
import { createTableStateMachine, tableStateRef, tablesSortEvent } from "./table-state-machine";
import { actorSystem } from "~/state";
import { useActor } from "@xstate/react";
import { QueryActorRef } from "~/state/machines";

export const createResultsPanelMachine = (queryId: string) => {
  return createMachine(
    {
      id: "results-panel-machine",
      tsTypes: {} as import("./results-panel-machine.typegen").Typegen0,
      schema: {
        context: {} as ResultsPanelContext,
        events: {} as ResultsPanelEvents,
      },
      initial: "realtime",
      context: {
        tablePreviews: [],
        tableStateRef: spawn(createTableStateMachine()),
      },
      on: {
        CLEAR_SELECTION: {
          target: "realtime",
        },
        TRANSPOSE_TABLE_TOGGLE: {
          actions: "transposeTable",
        },
        ADD_PREVIEW_TABLE: {
          actions: ["addPreviewTable", "expandResultsPanel"],
          target: "preview",
        },
      },
      states: {
        realtime: {
          id: "realtime",
          on: {
            SET_SELECTION_ACTIVE: "selection",
            SET_PREVIEW_ACTIVE: {
              target: "preview",
              actions: "setPreviewActive",
            },
            REMOVE_TABLE_PREVIEW: {
              actions: "removeTablePreview",
              target: "realtime",
            },
            SET_ACTIVE_TABLE_PREVIEW: {
              actions: "setActivePreviewTab",
              target: "preview",
            },
          },
        },
        selection: {
          on: {
            QUERY_RUN_EXECUTED: "realtime",
            SET_REALTIME_ACTIVE: "realtime",
            SET_PREVIEW_ACTIVE: {
              target: "preview",
              actions: "setPreviewActive",
            },
            SET_ACTIVE_TABLE_PREVIEW: {
              actions: "setActivePreviewTab",
              target: "preview",
            },
          },
        },
        preview: {
          on: {
            QUERY_RUN_EXECUTED: "realtime",
            SET_REALTIME_ACTIVE: "realtime",
            SET_SELECTION_ACTIVE: "selection",
            REMOVE_TABLE_PREVIEW: {
              actions: "removeTablePreview",
              target: "#realtime",
            },
            SET_ACTIVE_TABLE_PREVIEW: {
              actions: "setActivePreviewTab",
              target: "preview",
            },
          },
        },
      },
    },
    {
      actions: {
        setActivePreviewTab: assign((context, event) => {
          return {
            activeTablePreview: event.table,
          };
        }),
        removeTablePreview: assign((context, event) => {
          return {
            activeTablePreview: undefined,
            tablePreviews: context.tablePreviews.filter((preview) => preview.table !== event.table),
          };
        }),
        addPreviewTable: assign((context, event) => {
          return {
            activeTablePreview: event.table,
            tablePreviews: [
              ...context.tablePreviews,
              { table: event.table, ref: spawn(createTablePreviewMachine({ table: event.table })) },
            ],
          };
        }),
        expandResultsPanel: () => {
          const queryActor = actorSystem.get<QueryActorRef>(`query-${queryId}`);
          const panelRef = queryActor?.getSnapshot()?.context.panelSizeRef;
          if (panelRef) {
            panelRef.send({ type: "ANIMATE_TOP_RIGHT", target: 50 });
          }
        },
        transposeTable: assign((context) => {
          return { transposeTable: !context.transposeTable };
        }),
      },
    }
  );
};

type ResultsPanelContext = {
  tablePreviews: { table: string; ref: TablePreviewRef }[];
  activeTablePreview?: string;
  transposeTable?: boolean;
  tableStateRef: tableStateRef;
};

type ResultsPanelEvents =
  | {
      type: "SET_REALTIME_ACTIVE";
    }
  | {
      type: "SET_SELECTION_ACTIVE";
    }
  | {
      type: "SET_PREVIEW_ACTIVE";
      id: string;
    }
  | {
      type: "CLEAR_SELECTION";
    }
  | {
      type: "ADD_PREVIEW_TABLE";
      table: string;
    }
  | {
      type: "REMOVE_TABLE_PREVIEW";
      table: string;
    }
  | {
      type: "SET_ACTIVE_TABLE_PREVIEW";
      table: string;
    }
  | {
      type: "QUERY_RUN_EXECUTED";
    }
  | {
      type: "SELECTION_RUN_EXECUTED";
    }
  | {
      type: "TRANSPOSE_TABLE_TOGGLE";
    };

export type ResultsPanelRef = ActorRefFrom<ReturnType<typeof createResultsPanelMachine>>;
export type ResultsPanelState = StateFrom<ReturnType<typeof createResultsPanelMachine>>;

export const useMaybeResultsPanelMachine = (queryId: string) => {
  const systemRef = actorSystem.get<QueryActorRef>(`query-${queryId}`);
  const resultsPanelRef = systemRef
    ? systemRef.getSnapshot()?.context.resultsPanelRef!
    : (toActorRef({ send: () => {} }) as ResultsPanelRef);
  const [state, send] = useActor(resultsPanelRef!);
  const tableStateRef = systemRef
    ? resultsPanelRef?.getSnapshot()?.context.tableStateRef!
    : (toActorRef({ send: () => {} }) as tableStateRef);
  const [stateTable, sendTable] = useActor(tableStateRef!);
  if (!systemRef) return undefined;
  return {
    isRealtimeMode: state.matches("realtime"),
    isSelectionMode: state.matches("selection"),
    isPreviewMode: state.matches("preview"),
    setRealtimeActive: () => send({ type: "SET_REALTIME_ACTIVE" }),
    addPreviewTable: (table: string) => send({ type: "ADD_PREVIEW_TABLE", table }),
    setActiveTablePreview: (table: string) => send({ type: "SET_ACTIVE_TABLE_PREVIEW", table }),
    removeTablePreview: (table: string) => send({ type: "REMOVE_TABLE_PREVIEW", table }),
    tablePreviews: state.context?.tablePreviews ?? [],
    activeTablePreview: state.context?.activeTablePreview,
    isTransposedTable: state.context?.transposeTable ?? false,
    toggleTransposedTable: () => send({ type: "TRANSPOSE_TABLE_TOGGLE" }),
    updateTablesSortFormat: (sort: tablesSortEvent) => sendTable({ type: "UPDATE_TABLES_SORT_FORMAT", sort }),
    tablesSortFormat: stateTable.context.tablesSortFormat,
  };
};
