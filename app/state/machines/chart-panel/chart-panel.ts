import { uniq } from "lodash";
import { visualization } from "@fscrypto/domain";
import { ActorRefFrom, assign, createMachine, raise, type StateFrom } from "xstate";
import { actorSystem } from "~/state";
import { useSelector } from "@xstate/react";
import { useCallback } from "react";
import { tracking } from "~/utils/tracking";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { QueryRunsActorRef } from "../query-run";
import { VisualizationActorRef, VisualizationsActorRef } from "../visualization";
export const createChartPanelMachine = () =>
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QGMAWBDATgFwAroDswAbAYgGEAJAQQCUAVAfV2oDkBRAGQDoBldpgDUAkrwCq1TsIBa1esIDyrRsIAivANoAGALqJQABwD2sAJbZTRgvpABPRAFoAzAFYt3LZ60AmAGy+tJyDfbwAaEAAPRH8nbl8ADgB2FwAWT28XJKcAX2zwtCw8QhIKGgZmNi5ualVVRhFxSRk5RWU1bT0kEGMzCysbewRnNw8vPwCgpxDwqIQYuKTU9MzEnLyQApx8IjIqOiYWDh5+JmpyeUF2etEJKVl5JQ6bHvNLay7B4fcvH39A4LCkWivliCWSaR8KzW+QwW2KuzKB0qxwEjDOFyuDVuzQerA0AEZOoYTK9+l1ZklvNwAJyJQJpJyJeIualafHhT746nU7j4pwpbzU-FaanxIIuFzeXIwwrbEp7cqHKonNHnYSXa6NO4tR7eIndEl9d6gT4pRncNyeFJ81x0pzUmaIPneRLcRluXz41aJam+aUbWFFHbcIwAdyImFK+wqR24HAA6prsfdWk8ui8jTZZp73JafIlknTxhzHPb4qN0n9JiF-ZsgyQQ+GwJhuERQ1HFcjuORaOw5Jibk0U49dM9DW8s074ikLakEvFvPiUokYokSwhMu5udzVik0t4nPFqbXA3LiI2I9xIOZuLAwNgLAQoLAQwYwAQO0jY-QFABxX+cFcvCUAoiYnPIrC-poo7puOZKgLMXK5k4+IZE4-xTK464hBaXiHiKGRaMkx7rHWZ4Xs2V4QDed4PqYT4vsgxAmJAn4xlUP7-oBjDAaBPECBBUFpsSvQTuSiDeD43AuvyKS+C4ITWiC8TrqhLgVkRnrMmyLherk6wEEYEBwDYZHwmOonwUCQxcoCnwuKsGnoVo04Ci5J6yvCFGYBZpLGtZDhLik64OCkzK4ekYpmkkzIeXCwZhpeba+Zm4kIFo66HikcX1ueiWUde2ApWJCGOL6IX4qh3ApNu8mHsyBY5eR+UtoVt73o+z7FVZsyhSpdiON4M7br6UxhfSiRNV5LVUTRHX0c+r7vt1-mzBlA0IN48TxFNCVNq11HYO1dEMdwTEsRAK2Tul64ClSLi7Q2BgAK4AEbEKYyBXWlgV7uudL4vp2RAA */
      id: "chartPanel",
      tsTypes: {} as import("./chart-panel.typegen").Typegen0,
      schema: {
        context: {} as ChartPanelContext,
        events: {} as Event | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        visualizationIds: [],
        isOwner: false,
      },
      on: {
        "CHART_PANEL.INITIALIZE_OWNER": {
          actions: ["initializeOwner"],
          target: "owner",
        },
        "CHART_PANEL.INITIALIZE_PUBLIC": {
          actions: ["initializePublic"],
          target: "public",
        },
        "CHART_PANEL.SET_ACTIVE_VISUALIZATION": {
          actions: ["setActiveVisualization"],
        },
        "CHART_PANEL.ADD_VISUALIZATION_ID": {
          actions: ["addVisualizationId"],
        },
        "WORK_ITEMS.REMOVE": {
          description: "if the work item type is a viz, Remove visualization from the list of visualizations",
          actions: ["maybeRemoveVisualization"],
        },
      },
      initial: "owner",
      states: {
        owner: {
          on: {
            "CHART_PANEL.CHOOSE_VISUALIZATION_TYPE": {
              target: "owner.choose",
              actions: ["chooseVisualization"],
            },
            "CHART_PANEL.DELETE_VISUALIZATION": {
              actions: ["deleteVisualization"],
              target: "owner.idle",
            },
          },
          initial: "idle",
          states: {
            idle: {
              always: [
                { target: "choose", cond: "isEmptyVisualizations" },
                { target: "edit", cond: "isNotEmptyVisualizations" },
              ],
            },
            choose: {
              on: {
                "CHART_PANEL.CREATE_VISUALIZATION": {
                  target: "creating",
                },
              },
            },
            creating: {
              invoke: {
                id: "createVisualization",
                src: "createVisualization",
              },
              on: {
                "CHART_PANEL.CREATED": {
                  actions: [(_, e) => console.log("CREATED", e.payload), "handleNewVisualization"],
                  target: "edit",
                },
              },
            },
            edit: {
              type: "parallel",
              states: {
                settings: {
                  initial: "open",
                  states: {
                    open: {
                      on: {
                        "CHART_PANEL.TOGGLE_SHOW_SETTINGS": {
                          target: "closed",
                          actions: ["trackingHideSettings"],
                        },
                      },
                    },
                    closed: {
                      on: {
                        "CHART_PANEL.TOGGLE_SHOW_SETTINGS": {
                          target: "open",
                          actions: ["trackingShowSettings"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        public: {},
      },
    },
    {
      actions: {
        initializePublic: assign((_ctx, event) => {
          const queryRunRefs = actorSystem.get<QueryRunsActorRef>("queryRuns")!.getSnapshot()!.context.queryRuns;
          const queryRuns = queryRunRefs.map((ref) => ref.getSnapshot()!.context);
          const queryRunCtx = queryRuns.find((qr) => qr.queryRun?.queryId === event.payload.queryId);
          return {
            queryId: event.payload.queryId,
            queryRunId: queryRunCtx?.queryRun?.id,
            visualizationIds: event.payload.visualizationIds,
            activeVisualizationId: event.payload.visualizationIds[0],
            isOwner: false,
          };
        }),
        initializeOwner: assign((_ctx, event) => {
          const queryRunRefs = actorSystem.get<QueryRunsActorRef>("queryRuns")!.getSnapshot()!.context.queryRuns;
          const queryRuns = queryRunRefs.map((ref) => ref.getSnapshot()!.context);
          const queryRunCtx = queryRuns.find((qr) => qr.queryRun?.queryId === event.payload.queryId);
          return {
            queryId: event.payload.queryId,
            queryRunId: queryRunCtx?.queryRun?.id,
            visualizationIds: event.payload.visualizationIds,
            activeVisualizationId: event.payload.visualizationIds[0],
            isOwner: true,
          };
        }),
        handleNewVisualization: assign((context, event) => {
          return {
            activeVisualizationId: event.payload.id,
            visualizationIds: uniq([...context.visualizationIds, event.payload.id]),
          };
        }),
        chooseVisualization: assign((_ctx, _event) => {
          return {
            activeVisualizationId: undefined,
          };
        }),
        setActiveVisualization: assign((_ctx, event) => {
          return {
            activeVisualizationId: event.payload,
          };
        }),
        deleteVisualization: assign((context, event) => {
          const visRef = actorSystem.get<VisualizationActorRef>(`visualization-${event.payload}`);
          if (!visRef) return {};
          visRef.send({ type: "VISUALIZATION.DELETE" });
          const remaining = context.visualizationIds.filter((id) => id !== event.payload);
          if (remaining.length === 0) {
            return {
              visualizationIds: [],
              activeVisualizationId: undefined,
            };
          }
          if (event.payload === context.activeVisualizationId) {
            return {
              visualizationIds: remaining,
              activeVisualizationId: remaining[0],
            };
          }
          return {
            visualizationIds: remaining,
          };
        }),
        //@ts-ignore
        maybeRemoveVisualization: raise((context, event) => {
          if (event.payload.typename === "visualization") {
            return {
              type: "CHART_PANEL.DELETE_VISUALIZATION",
              payload: event.payload.id,
            };
          }
          return undefined;
        }),
        addVisualizationId: assign((context, event) => {
          return {
            visualizationIds: uniq([...context.visualizationIds, event.payload]),
          };
        }),
        trackingHideSettings: (ctx) => {
          tracking("collapse_chart_config_panel", "Query Editor", { query_id: ctx.queryId! });
        },
        trackingShowSettings: (ctx) => {
          tracking("expand_chart_config_panel", "Query Editor", { query_id: ctx.queryId! });
        },
      },
      services: {
        createVisualization: (_ctx, event) => (callback) => {
          const { chartType, queryId } = event.payload;
          const vis = visualization.newSchema.parse({ queryId, chartType, chart: { type: chartType } });
          const ref = actorSystem.get<VisualizationsActorRef>("visualizations")!;
          ref.send({
            type: "VISUALIZATIONS.CREATE",
            payload: vis,
            onDone: (v) => {
              callback({ type: "CHART_PANEL.CREATED", payload: v });
            },
          });
        },
        globalEvents: () => globalEvents$$,
      },
      guards: {
        isEmptyVisualizations: (ctx) => ctx.visualizationIds.length === 0,
        isNotEmptyVisualizations: (ctx) => ctx.visualizationIds.length > 0,
      },
    }
  );

interface ChartPanelContext {
  visualizationIds: string[];
  activeVisualizationId?: string;
  isOwner: boolean;
  queryId?: string;
}
type Event =
  | { type: "CHART_PANEL.INITIALIZE_PUBLIC"; payload: { queryId: string; visualizationIds: string[] } }
  | { type: "CHART_PANEL.INITIALIZE_OWNER"; payload: { queryId: string; visualizationIds: string[] } }
  | { type: "CHART_PANEL.ADD_VISUALIZATION_ID"; payload: string }
  | { type: "CHART_PANEL.TOGGLE_SHOW_SETTINGS" }
  | { type: "CHART_PANEL.DELETE_VISUALIZATION"; payload: string }
  | { type: "CHART_PANEL.CHOOSE_VISUALIZATION_TYPE" }
  | { type: "CHART_PANEL.SET_ACTIVE_VISUALIZATION"; payload?: string }
  | { type: "CHART_PANEL.CREATED"; payload: visualization.Visualization }
  | {
      type: "CHART_PANEL.CREATE_VISUALIZATION";
      payload: { chartType: visualization.Visualization["chartType"]; queryId: string };
      onDone?: (vis: visualization.Visualization) => void;
    };

export type ChartPanelActorRef = ActorRefFrom<ReturnType<typeof createChartPanelMachine>>;
type State = StateFrom<ReturnType<typeof createChartPanelMachine>>;

const visualizationIdsSelector = (state: State) => state.context.visualizationIds;
const activeVisualizationIdSelector = (state: State) => state.context.activeVisualizationId;
const showSettingsSelector = (state: State) => state.matches("owner.edit.settings.open");
const chooseChartSelector = (state: State) => state.matches("owner.choose");
const queryIdSelector = (state: State) => state.context.queryId;
const isOwnerSelector = (state: State) => state.context.isOwner;
const isCreating = (state: State) => state.matches("owner.creating");

export const useChartPanel = () => {
  const chartPanelRef = actorSystem.get<ChartPanelActorRef>("chartPanel")!;
  const { send } = chartPanelRef;
  return {
    visualizationIds: useSelector(chartPanelRef, visualizationIdsSelector),
    activeVisualizationId: useSelector(chartPanelRef, activeVisualizationIdSelector),
    isShowSettings: useSelector(chartPanelRef, showSettingsSelector),
    isChooseChart: useSelector(chartPanelRef, chooseChartSelector),
    isOwner: useSelector(chartPanelRef, isOwnerSelector),
    isCreating: useSelector(chartPanelRef, isCreating),
    queryId: useSelector(chartPanelRef, queryIdSelector),
    chooseChart: useCallback(() => {
      send({ type: "CHART_PANEL.CHOOSE_VISUALIZATION_TYPE" });
    }, [send]),
    createChart: useCallback(
      (
        chartType: visualization.Visualization["chartType"],
        queryId: string,
        onDone?: (vis: visualization.Visualization) => void
      ) => {
        send({ type: "CHART_PANEL.CREATE_VISUALIZATION", payload: { chartType, queryId }, onDone });
      },
      [send]
    ),
    setActiveVisId: useCallback(
      (id?: string) => send({ type: "CHART_PANEL.SET_ACTIVE_VISUALIZATION", payload: id }),
      [send]
    ),
    deleteVisualization: useCallback(
      (id: string) => send({ type: "CHART_PANEL.DELETE_VISUALIZATION", payload: id }),
      [send]
    ),
    toggleSettings: useCallback(() => send({ type: "CHART_PANEL.TOGGLE_SHOW_SETTINGS" }), [send]),
    initializePublic: useCallback(
      (queryId: string, visualizationIds: string[]) => {
        send({
          type: "CHART_PANEL.INITIALIZE_PUBLIC",
          payload: { queryId: queryId, visualizationIds: visualizationIds },
        });
      },
      [send]
    ),
    initializeOwner: useCallback(
      (queryId: string, visualizationIds: string[]) => {
        send({
          type: "CHART_PANEL.INITIALIZE_OWNER",
          payload: { queryId: queryId, visualizationIds: visualizationIds },
        });
      },
      [send]
    ),
  };
};
