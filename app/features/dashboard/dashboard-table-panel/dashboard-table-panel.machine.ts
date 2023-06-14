import type { query, user } from "@fscrypto/domain";
import type { ActorRefFrom, StateFrom } from "xstate";
import { createMachine, assign, sendParent } from "xstate";
import { $path } from "remix-routes";
import type { QueryRunResult } from "~/services/legacy-query-run-service.server";

import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { ephemeralQueryMachine } from "../dashboard-grid/ephemeralQueryMachine";
import { CustomParameter } from "../dashboard-parameters/dashboard-parameters.machine";
import { useSelector } from "@xstate/react";

interface TablePanelProps {
  queryId?: string;
  cellId: string;
  dashboardId?: string;
}

export const createTablePanelMachine = ({ queryId, cellId, dashboardId }: TablePanelProps) => {
  const machine = createMachine(
    {
      id: `tablePanel-${queryId}`,
      tsTypes: {} as import("./dashboard-table-panel.machine.typegen").Typegen0,
      schema: {
        context: {} as TablePanelContext,
        events: {} as TablePanelEvent | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        queryId,
        data: {},
        latestParameters: [],
        enteredViewport: false,
        filterString: "",
        cellId,
      },
      initial: "selecting",
      states: {
        selecting: {
          description:
            "this will determine if the panel needs to remain in selecting mode. If it doesn't have an id it'll stay here",
          always: [
            {
              target: "ready",
              cond: "hasQueryId",
            },
          ],
          on: {
            "DASHBOARD.TABLE_PANEL.CANCEL_ADD": {
              target: "idle",
              actions: ["removeCell"],
            },
            "DASHBOARD.TABLE_PANEL.SELECT_ITEM": {
              actions: ["updateCellFormula", "uploadParentCellFormula"],
              target: "loading",
            },
          },
        },
        loading: {
          invoke: {
            id: "fetchQueryData",
            src: "fetchQueryData",
            onDone: {
              target: "loading.complete",
              actions: "hydrateTable",
            },
            onError: {
              target: "error",
            },
          },
          initial: "request",
          states: {
            request: {},
            complete: {
              always: [
                {
                  description: "one the data has loaded, check to see if params have been triggered and use them",
                  target: "#fetchingEphemeralQuery",
                  cond: "shouldUseParamData",
                },
                {
                  target: "#idle",
                },
              ],
            },
          },
        },
        ready: {
          on: {
            "DASHBOARD.PARAMETERS.APPLY_PARAMETERS": {
              actions: ["updateParams"],
            },
            "DASHBOARD.TABLE_PANEL.ENTERED_VIEWPORT": [
              {
                target: "fetchingEphemeralQuery",
                actions: ["enteredViewport"],
                cond: "shouldUseParamData",
                description:
                  "if the tab is set to active, check if the panel has params to be applied and the params have been applied previously",
              },
              {
                target: "loading",
                cond: "noDataYet",
                description: "if there is no data fetch it",
                actions: ["enteredViewport"],
              },
              {
                target: "idle",
                actions: ["enteredViewport"],
              },
            ],
          },
        },
        idle: {
          id: "idle",
          on: {
            "DASHBOARD.PARAMETERS.APPLY_PARAMETERS": {
              target: "fetchingEphemeralQuery",
              actions: ["updateParams"],
              cond: "hasParamsToApply",
            },
          },
        },
        fetchingEphemeralQuery: {
          id: "fetchingEphemeralQuery",
          invoke: {
            id: "fetchEphemeralQuery",
            src: ephemeralQueryMachine,
            data: (context) => {
              return {
                queryId: context.data.query?.id,
                statement: context.data.query?.statement,
                parameters: context.latestParameters,
              };
            },
            onDone: {
              target: "#success",
              actions: ["setQueryRunData"],
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
        error: {
          after: {
            2000: "idle",
          },
        },
        refreshing: {
          on: {
            "DASHBOARD.REFRESH.REFRESH_FINISHED": {
              target: "loading",
              cond: "isDashboard",
            },
          },
        },
      },
      on: {
        "DASHBOARD.REFRESH.QUERY_RUN_EXECUTED": {
          target: "refreshing",
          cond: "isDashboard",
        },
        "DASHBOARD.RESET_PANELS": {
          actions: "resetData",
          target: "loading",
          cond: "alreadyHasData",
        },
      },
    },
    {
      services: {
        fetchQueryData: (context) => {
          const url =
            window.location.protocol +
            "//" +
            window.location.host +
            $path("/api/dashboards/queries/:id/get", { id: context.queryId! });
          return fetch(url, {
            method: "get",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => response.json());
        },
        globalEvents: () => globalEvents$$,
      },
      actions: {
        enteredViewport: assign((_) => {
          return {
            enteredViewport: true,
          };
        }),
        setQueryRunData: assign((context, event) => {
          return {
            data: {
              ...context.data,
              queryRun: event.data,
            },
            latestParameters: [],
          };
        }),
        updateParams: assign((context, event) => {
          return {
            latestParameters: event.payload.parameters,
          };
        }),
        hydrateTable: assign((context, event) => {
          return { data: event.data };
        }),
        removeCell: sendParent((context) => {
          return {
            type: "DASHBOARD.GRID.REMOVE_CELL",
            payload: { cellId: context.cellId },
          };
        }),
        uploadParentCellFormula: sendParent((context, event) => {
          return {
            type: "DASHBOARD.GRID.UPDATE_CELL_FORMULA",
            payload: {
              cellId: context.cellId,
              formula: { queryId: event.id },
            },
          };
        }),
        updateCellFormula: assign((context, event) => {
          return {
            queryId: event.id,
          };
        }),
        resetData: assign((_) => {
          return {
            data: {},
          };
        }),
      },
      guards: {
        hasQueryId: (context) => {
          return !!context.queryId;
        },
        hasParamsToApply: (context, event) => {
          const isDashboard = dashboardId === event.payload.dashboardId;
          return isDashboard && (context.data.query?.parameters.length ?? 0) > 0;
        },
        shouldUseParamData: (context, event) => {
          const queryParams = context.data.query?.parameters ?? [];
          const latestParams = context.latestParameters ?? [];
          return (
            queryParams.length > 0 &&
            latestParams.length > 0 &&
            (context.enteredViewport || event.type === "DASHBOARD.TABLE_PANEL.ENTERED_VIEWPORT")
          );
        },
        noDataYet: (context) => {
          return !context.data.queryRun;
        },
        isDashboard: (context, event) => {
          return dashboardId === event.payload.dashboardId;
        },
        alreadyHasData: (context, event) => {
          return !!context.data.queryRun && dashboardId === event.payload.dashboardId;
        },
      },
    }
  );
  return machine;
};

interface TablePanelContext {
  filterString: string;
  cellId: string;
  queryId?: string;
  data: { query?: query.Query; queryRun?: QueryRunResult; owner?: user.UserDisplay };
  latestParameters: CustomParameter[];
  enteredViewport: boolean;
}

type TablePanelEvent =
  | {
      type: "POLLING_QUERY";
    }
  | {
      type: "done.invoke.fetchQueryData";
      data: { query: query.Query; queryRun?: QueryRunResult; owner: user.UserDisplay };
    }
  | {
      type: "done.invoke.fetchEphemeralQuery";
      data: QueryRunResult;
    }
  | {
      type: "DASHBOARD.TABLE_PANEL.ENTERED_VIEWPORT";
    }
  | {
      type: "REFRESH_QUERY_RUN_EXECUTED";
    }
  | {
      type: "DASHBOARD.TABLE_PANEL.CANCEL_ADD";
    }
  | {
      type: "DASHBOARD.TABLE_PANEL.SELECT_ITEM";
      id: string;
    };

export type TablePanelActorRef = ActorRefFrom<ReturnType<typeof createTablePanelMachine>>;
export type TablePanelState = StateFrom<ReturnType<typeof createTablePanelMachine>>;

export const useTablePanelMachine = (cellRef: TablePanelActorRef) => {
  const isLoading = useSelector(cellRef, isLoadingSelector);
  const isFetchingEphemeralQuery = useSelector(cellRef, isFetchingEphemeralQuerySelector);
  const isReady = useSelector(cellRef, isReadySelector);
  const isRefreshing = useSelector(cellRef, isRefreshingSelector);
  const isSelecting = useSelector(cellRef, isSelectingSelector);
  const data = useSelector(cellRef, dataSelector);
  const enteredViewport = useSelector(cellRef, enteredViewportSelector);

  const selectItem = (id: string) => cellRef.send({ type: "DASHBOARD.TABLE_PANEL.SELECT_ITEM", id });
  const cancelAdd = () => cellRef.send({ type: "DASHBOARD.TABLE_PANEL.CANCEL_ADD" });
  const onEnterViewport = () => cellRef.send({ type: "DASHBOARD.TABLE_PANEL.ENTERED_VIEWPORT" });
  return {
    isLoading,
    isFetchingEphemeralQuery,
    isReady,
    isRefreshing,
    isSelecting,
    data,
    enteredViewport,
    selectItem,
    cancelAdd,
    onEnterViewport,
  };
};

const isLoadingSelector = (state: TablePanelState) => state.matches("loading");
const isFetchingEphemeralQuerySelector = (state: TablePanelState) => state.matches("fetchingEphemeralQuery");
const isReadySelector = (state: TablePanelState) => state.matches("ready");
const isRefreshingSelector = (state: TablePanelState) => state.matches("refreshing");
const isSelectingSelector = (state: TablePanelState) => state.matches("selecting");

const dataSelector = (state: TablePanelState) => state.context.data;
const enteredViewportSelector = (state: TablePanelState) => state.context.enteredViewport;
