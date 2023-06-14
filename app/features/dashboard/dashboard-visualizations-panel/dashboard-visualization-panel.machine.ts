import type { dashboard, query, user, visualization } from "@fscrypto/domain";
import type { ActorRefFrom, StateFrom } from "xstate";
import { createMachine, assign, sendParent } from "xstate";
import { $path } from "remix-routes";
import type { Data } from "@fscrypto/viz";
import type { QueryRunResult } from "~/services/legacy-query-run-service.server";
import { zipObject } from "lodash";
import { actorSystem } from "~/state";
import { GlobalEvent, globalEvents$$ } from "~/state/events";

import { CustomParameter } from "../dashboard-parameters/dashboard-parameters.machine";
import { ephemeralQueryMachine } from "../dashboard-grid/ephemeralQueryMachine";
import { useSelector } from "@xstate/react";
import { VisualizationsActorRef } from "~/state/machines";

interface VisualCellProps {
  cell: dashboard.Cell;
  visId?: string;
  cellId: string;
  dashboardId: string;
}

export const createVisualizationPanelMachine = ({ visId, cellId, dashboardId }: VisualCellProps) => {
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOljABsxMAXAqAYgGEBBAOSYFEAZAfRYAiAgNoAGALqJQABwD2sXHVn4pIAB6IA7ABYAbCW0BmPYYBMogKwBGXdquGANCACeiXaYCcJUaYu2bHhaGVlamAL5hTmhYeISk5FS09AwAqgAKAiwAKpy8AGIAktw5AEpikkggcgpKKpUaCKaa+oaaoobBptoWzYYAHBZOro0WfSQeHlZ93RMW2qJ9hhFRGDgExGSU1HT4jADKPJxMWbwFOQCy5arVirjKqg39oiR9nlYezboe2ubaQ4h9KwGPqaCyiQK+D5BPrLEDRNZxTaJHaMK6VG61B6IQweZ6vSYfXRfH6iP4uRC-Ei6PymXT9PqAzQeWyw+GxDYJbbJYRWCoyeS3e71RAWUz-BBWUWaKldCZfSzTfqs1bs0gUWToCDJCDKMAkAgAN1kAGs9QAzMA0HAANVwsAArugKLgAF7oWpo-k1O51UCPDyGAx+IL9UytKa2cUAWnephIo1lPSZo10OmVMXWao1Wt2DDAACd87J8yRpBR3Wbi6gSBardhbQ6na73T7PVUBZjhRLQtLvv1JUFcRZvuKwxYDLjdKJNF1bIZLOmERt1Zr6CRMLJUGXLWAGG2MT6sd2muMjICLIPLCPyRL+vGBziz+5gtpF6qSCuc1B15vtzRdzyfLtt6Qp+loYo3lYCyBqYViaDYgKGO4fhLJEcIqpmJD5mAmrOAwBwnCwxwFNauRZCwABC+4doeXbuOKVjzNoVKtGC3SgvYHxvph2G4QwLBpGk3AAJq8GkLAlCw5ycKUezUSBvrqIgATPPY2jaJoOI9EYgyQT8cbvDoizgoYQQsmhbKYbgEBUPxgkiWJElSTJnAlHJEjXDRoFKQg9Lxr4og2MYILzmSwx9uMrTaK8miaH08qvhZGGItZtkEacbBEVkJFkZR8mCopjwMv5YJBdFmmkgx85jMEILqa8rQdLo3GIrWCJQJw0jYGAqAFk6ACK9oFnhOqEPq+BGqaNaWjgnXdb1+YDUN+bOPlnZgQgHxjB4TTGGY7QLIE4qlSQTQ7aYvj4he4RJRmrUzbEHVdT1fUUINw0kGAajUPaKLvStDBpAA8tw3AFGwADivD9SkrnCWttEbaEcEkM0fSiBjughBpVjirYcbfMmUHTNCFgtRsbWPXNL2LW9y3OGQ9qYJgcCwHuHnol5hXYsVoqlXS5WhQx7zPAsoRTroAxQU05OkAWRb5gwaiwDQ7p6ugZr-vmyDmBjRAMJZiLy8WCPeQ0cH6GCyGpnYniE+KzIwZ4ti2O0pmjBEaH4LIEBwKohvEJ5ClHmFiBRnYzFzNoHxIcy8XBJostIlyuxBwVR5TNKF7BFMrw2x8x0DCQnGipKk550nn70Gn60+cY47dNSHQNfB8WhwgUZmNKlg6EZRhTkqt1Llmq67D+W5UP+NeIz5WNAmXRKBESzQFzeMZtFSbSiNS9it6mMJD++vEQMMXrp12fjMb85ipp4AxzAxoqBtY7g-NM0c-M1h9WTZYDT2b2IjCo0CujV+HhGTUmFu0U6owoJxXcIxakSdKb0GpgtJaw1-7c02vOcYu0jDmGqkdG8SF9Dox+DpKYAZ0Zk2-vdOsqDnroLph9L6P0-r0ywRnUk0p3CaRsD4XwcVNB4yAWeYcyZfCSw8Mgh6jD5qvX+gzOQFBnSp05sHLsjFoF0iQsYdS-RRSiMDOIj4EI-B9BkXQimcjdhoMUfTRmzNWZcK0WGQMUxrCBEsAsAYjgbyl1PNFakpdNJEiTsbfMriNoggdu4U6hCQiIXOp7MIQA */
  const machine = createMachine(
    {
      id: `visualCell-${visId}`,
      tsTypes: {} as import("./dashboard-visualization-panel.machine.typegen").Typegen0,
      schema: {
        context: {} as VisualizationPanelContext,
        events: {} as VisualizationPanelEvent | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        visId,
        data: {},
        cellId,
        filterString: "",
        latestParameters: [],
        enteredViewport: false,
      },
      initial: "selecting",

      states: {
        selecting: {
          description:
            "this will determine if the panel needs to remian in selecting mode. If it doesn't have an id itll stay here",
          always: [
            {
              target: "ready",
              cond: "hasVisId",
            },
          ],
          on: {
            "DASHBOARD.VISUALIZATION_PANEL.CANCEL_ADD": {
              target: "idle",
              actions: ["removeCell"],
            },
            "DASHBOARD.VISUALIZATION_PANEL.UPDATE_FILTER": {
              actions: "updateFilter",
            },
            "DASHBOARD.VISUALIZATION_PANEL.SELECT_ITEM": {
              actions: ["updateCellFormula", "uploadParentCellFormula"],
              target: "loading",
            },
          },
        },
        waitingToEnterViewport: {
          on: {
            "DASHBOARD.VISUALIZATION_PANEL.ENTERED_VIEWPORT": "loading",
          },
        },
        loading: {
          invoke: {
            id: "fetchVisualization",
            src: "fetchVisualization",
            onDone: {
              target: "loading.complete",
              actions: ["hydrateVisualization"],
            },
            onError: {
              target: "error",
            },
          },
          states: {
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
              description: "add the parameters ready for if the panel becomes active",
              actions: ["updateParams"],
            },
            "DASHBOARD.VISUALIZATION_PANEL.ENTERED_VIEWPORT": [
              {
                target: "fetchingEphemeralQuery",
                actions: ["enteredViewport"],
                cond: "hasParamsInQueryAndParamsSet",
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
              cond: "hasParamsInQuery",
            },
            "DASHBOARD.VISUALIZATION_PANEL.ENTERED_VIEWPORT": {
              actions: ["enteredViewport"],
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
              actions: ["setEphemeralQueryRunData"],
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
        fetchVisualization: (context) => {
          const url =
            window.location.protocol +
            "//" +
            window.location.host +
            $path("/api/dashboards/visualizations/:id/get", { id: context.visId! });
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
        setEphemeralQueryRunData: assign((context, event) => {
          return {
            data: {
              ...context.data,
              visData: event.data.data.map((ds) => zipObject(event.data.columns, ds)) as Data[],
            },
            latestParameters: [],
          };
        }),
        updateParams: assign((context, event) => {
          return {
            latestParameters: event.payload.parameters,
          };
        }),
        hydrateVisualization: assign((context, event) => {
          const visRef = actorSystem.get<VisualizationsActorRef>("visualizations")!;
          if (event.data.visualization) {
            visRef.send({ type: "VISUALIZATIONS.ADD", payload: event.data.visualization });
          }
          return { data: event.data };
        }),
        removeCell: sendParent((context) => {
          return {
            type: "DASHBOARD.GRID.REMOVE_CELL",
            payload: { cellId: context.cellId },
          };
        }),
        updateFilter: assign((context, event) => {
          return { filterString: event.value };
        }),
        uploadParentCellFormula: sendParent((context, event) => {
          return {
            type: "DASHBOARD.GRID.UPDATE_CELL_FORMULA",
            payload: {
              cellId: context.cellId,
              formula: { visId: event.id },
            },
          };
        }),
        updateCellFormula: assign((context, event) => {
          return {
            visId: event.id,
          };
        }),
        resetData: assign((_) => {
          return {
            data: {},
          };
        }),
      },
      guards: {
        hasVisId: (context) => {
          return !!context.visId;
        },
        hasParamsInQuery: (context, event) => {
          const isDashboard = dashboardId === event.payload.dashboardId;
          return isDashboard && (context.data.query?.parameters.length ?? 0) > 0;
        },
        hasParamsInQueryAndParamsSet: (context, event) => {
          return (
            (context.data.query?.parameters.length ?? 0) > 0 &&
            context.latestParameters.length > 0 &&
            (context.enteredViewport || event.type === "DASHBOARD.VISUALIZATION_PANEL.ENTERED_VIEWPORT")
          );
        },
        shouldUseParamData: (context) => {
          const queryParams = context.data.query?.parameters ?? [];
          const latestParams = context.latestParameters ?? [];
          return queryParams.length > 0 && latestParams.length > 0;
        },
        noDataYet: (context) => {
          return !context.data.visData;
        },
        isDashboard: (context, event) => {
          return dashboardId === event.payload.dashboardId;
        },
        alreadyHasData: (context, event) => {
          return !!context.data.visData && dashboardId === event.payload.dashboardId;
        },
      },
    }
  );
  return machine;
};

interface VisualizationPanelContext {
  filterString: string;
  cellId: string;
  visId?: string;
  activeTab?: number;
  data: {
    visualization?: visualization.Visualization;
    visData?: Data[];
    owner?: user.User;
    updatedAt?: Date;
    query?: query.Query;
  };
  latestParameters: CustomParameter[];
  enteredViewport: boolean;
}

type VisualizationPanelEvent =
  | { type: "POLLING_QUERY" }
  | {
      type: "done.invoke.fetchVisualization";
      data: {
        visualization?: visualization.Visualization;
        visData?: Data[];
        owner?: user.User;
        updatedAt: Date;
        query?: query.Query;
      };
    }
  | {
      type: "DASHBOARD.VISUALIZATION_PANEL.CANCEL_ADD";
    }
  | {
      type: "DASHBOARD.VISUALIZATION_PANEL.UPDATE_FILTER";
      value: string;
    }
  | {
      type: "DASHBOARD.VISUALIZATION_PANEL.SELECT_ITEM";
      id: string;
    }
  | {
      type: "done.invoke.fetchEphemeralQuery";
      data: QueryRunResult;
    }
  | {
      type: "DASHBOARD.VISUALIZATION_PANEL.ENTERED_VIEWPORT";
    };

export type VisualizationPanelActorRef = ActorRefFrom<ReturnType<typeof createVisualizationPanelMachine>>;
export type VisualizationPanelState = StateFrom<ReturnType<typeof createVisualizationPanelMachine>>;

export const useVisualizationPanelMachine = (cellRef: VisualizationPanelActorRef) => {
  const isLoading = useSelector(cellRef, isLoadingSelector);
  const isFetchingEphemeralQuery = useSelector(cellRef, isFetchingEphemeralQuerySelector);
  const isReady = useSelector(cellRef, isReadySelector);
  const isRefreshing = useSelector(cellRef, isRefreshingSelector);
  const isSelecting = useSelector(cellRef, isSelectingSelector);
  const data = useSelector(cellRef, dataSelector);
  const enteredViewport = useSelector(cellRef, enteredViewportSelector);

  const selectItem = (id: string) => cellRef.send({ type: "DASHBOARD.VISUALIZATION_PANEL.SELECT_ITEM", id });
  const cancelAdd = () => cellRef.send({ type: "DASHBOARD.VISUALIZATION_PANEL.CANCEL_ADD" });
  const onEnterViewport = () => cellRef.send({ type: "DASHBOARD.VISUALIZATION_PANEL.ENTERED_VIEWPORT" });

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

const isLoadingSelector = (state: VisualizationPanelState) => state.matches("loading");
const isFetchingEphemeralQuerySelector = (state: VisualizationPanelState) => state.matches("fetchingEphemeralQuery");
const isReadySelector = (state: VisualizationPanelState) => state.matches("ready");
const isRefreshingSelector = (state: VisualizationPanelState) => state.matches("refreshing");
const isSelectingSelector = (state: VisualizationPanelState) => state.matches("selecting");

const dataSelector = (state: VisualizationPanelState) => state.context.data;
const enteredViewportSelector = (state: VisualizationPanelState) => state.context.enteredViewport;
