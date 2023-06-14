import { Cell, ComponentType } from "@fscrypto/domain/src/dashboard";
import { useSelector } from "@xstate/react";
import { ActorRefFrom, StateFrom, assign, createMachine, toActorRef } from "xstate";
import { actorSystem } from "~/state";
import deepEquals from "fast-deep-equal";
import { Layout } from "react-grid-layout";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { DashboardTabsState } from "../dashboard-tabs/dashboard-tabs.machine";
import { createLayout } from "../util/createLayout";
import { filterTabCells } from "../util/filter-tab-cells";
import { CellWithRef, spawnPanelMachine } from "../util/spawn-panel-machine";
import { DashboardActorRef } from "../dashboard.machine";

export const createDashboardGridMachine = (draftCells: Cell[], publishedCells: Cell[], dashboardId: string) => {
  const machine = createMachine(
    {
      id: "dashboardCellsMachine",
      tsTypes: {} as import("./dashboard-grid.machine.typegen").Typegen0,
      schema: {
        context: {} as DashboardContext,
        events: {} as DashboardGridEvent | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        draftCells: [],
        publishedCells: [],
      },
      initial: "initializeMachines",
      states: {
        idle: {},
        initializeMachines: {
          always: {
            target: "idle",
            actions: "initializeMachines",
          },
        },
      },
      on: {
        "ADD_TO_DASHBOARD.ADD_CELL": {
          actions: ["addExternalCell", "refetchParameters"],
          cond: "isDashboard",
        },
        "DASHBOARD.GRID.UPDATE_LAYOUT": {
          actions: ["updateLayout", "persistLayout"],
        },
        "DASHBOARD.GRID.ADD_CELL": {
          actions: ["addCell", "refetchParameters"],
        },
        "DASHBOARD.GRID.REMOVE_CELL": {
          actions: ["removeCell", "refetchParameters"],
        },
        "DASHBOARD.GRID.ACTIVATE_TAB_MODE": {
          actions: ["activateTabMode", "persistLayout"],
        },
        "DASHBOARD.GRID.REMOVE_TAB_CELLS": {
          actions: ["removeTabCells"],
        },
        "DASHBOARD.PUBLISH.PUBLISH_SUCCESS": {
          description: "When a dashboard is published, we want to save the current draft cells as the published cells",
          actions: ["createPublishedCells"],
        },
        "DASHBOARD.GRID.UPDATE_CELL_FORMULA": {
          actions: ["updateCellFormula", "persistLayout"],
        },
        "DASHBOARD.GRID.MOVE_CELL_TO_TAB": {
          actions: ["moveCellToTab"],
        },
        "DASHBOARD.GRID.UPDATE_STYLES": {
          actions: ["updateCellStyles", "persistLayout"],
        },
      },
    },
    {
      actions: {
        initializeMachines: assign((_) => {
          const cellsWithRef = draftCells.map((cell) => ({ ...cell, ref: spawnPanelMachine(cell, dashboardId) }));
          const publishedCellsWithRef = publishedCells.map((cell) => ({
            ...cell,
            ref: spawnPanelMachine(cell, dashboardId),
          }));
          return { draftCells: cellsWithRef, publishedCells: publishedCellsWithRef };
        }),
        updateLayout: assign((context, event) => {
          const { layout } = event.payload;
          const newCells = context.draftCells.map((cell: CellWithRef) => {
            if (cell.type === "component") {
              const layoutComponent = layout.find((component: { i: string }) => component.i === cell.id);
              if (layoutComponent) {
                let { x, y, w, h } = layoutComponent;
                return { ...cell, component: { ...cell.component, x, y, w, h, format: "grid" } };
              }
            }
            return cell;
          });
          return { draftCells: newCells };
        }),
        persistLayout: (context) => {
          const currentDashboard = actorSystem.get<DashboardActorRef>(`dashboard-${dashboardId}`)?.getSnapshot()
            ?.context?.dashboard;
          if (currentDashboard) {
            const { draft } = currentDashboard;
            const currentCells = draft?.cells ?? [];
            //strip out the ref from the cells
            //eslint-disable-next-line @typescript-eslint/no-unused-vars
            const newCells = context.draftCells.map(({ ref, ...rest }) => rest);
            if (!deepEquals(currentCells, newCells)) {
              globalEvents$$.next({
                type: "DASHBOARD.SET_DATA",
                payload: { dashboard: { draft: { ...draft, cells: newCells } } },
                dashboardId,
              });
            }
          }
        },
        addCell: assign((context, event) => {
          const { type, position, formula, layout } = event.payload;

          const activeDraftTabId = actorSystem
            .get<DashboardActorRef>(`dashboard-${dashboardId}`)
            ?.getSnapshot()
            ?.context?.dashboardTabs?.getSnapshot()?.context.activeDraftTabId;
          const cellId = type + Math.random();

          const { x, y, w, h } = position;
          const newCell: Cell = {
            id: cellId,
            type: "component",
            component: { type, x, y, w, h, i: cellId, format: "grid", t: activeDraftTabId },
            formula,
          };
          const newCellWithRef = { ...newCell, ref: spawnPanelMachine(newCell, dashboardId) };
          // get the new layout coords and add them to the existing cell in context
          const newCells: CellWithRef[] = [...context.draftCells, newCellWithRef].map((cell) => {
            if (cell.component.t !== activeDraftTabId) return cell;
            if (cell.type === "component") {
              const layoutComponent = layout.find((component) => component.i === cell.id);
              if (layoutComponent) {
                let { x, y, w, h } = layoutComponent;
                return { ...cell, component: { ...cell.component, x, y, w, h } };
              }
              const droppedComponent = layout.find((component) => component.i === "dropped_item");
              if (droppedComponent) {
                let { x, y, w, h } = droppedComponent;
                return { ...cell, component: { ...cell.component, x, y, w, h } };
              }
            }
            return cell;
          });
          return { draftCells: newCells };
        }),
        addExternalCell: assign((context, event) => {
          const { cell } = event.payload;
          const activeDraftTabId = actorSystem
            .get<DashboardActorRef>(`dashboard-${dashboardId}`)
            ?.getSnapshot()
            ?.context?.dashboardTabs?.getSnapshot()?.context.activeDraftTabId;
          cell.component.t = activeDraftTabId;
          const newCellWithRef = { ...cell, ref: spawnPanelMachine(cell, dashboardId) };
          const newCells = [...context.draftCells, newCellWithRef];
          return { draftCells: newCells };
        }),
        removeCell: assign((context, event) => {
          const { cellId } = event.payload;
          const newCells = context.draftCells.filter((cell) => cell.id !== cellId);
          return { draftCells: newCells };
        }),
        activateTabMode: assign((context, event) => {
          const newCells = context.draftCells.map((cell) => {
            const newCellComponent = { ...cell.component, t: event.payload.activeTabId };
            return { ...cell, component: newCellComponent };
          });
          return { draftCells: newCells };
        }),
        removeTabCells: assign((context, event) => {
          if (event.payload.isLast) {
            const newCells = context.draftCells.map((cell) => {
              const newCellComponent = { ...cell.component, t: undefined };
              return { ...cell, component: newCellComponent };
            });
            return { draftCells: newCells };
          }
          const newCells = context.draftCells.filter((cell) => cell.component.t !== event.payload.tabId);
          return { draftCells: newCells };
        }),
        createPublishedCells: assign((context) => {
          return { publishedCells: context.draftCells };
        }),
        updateCellFormula: assign((context, event) => {
          const { cellId, formula } = event.payload;
          const newCells = context.draftCells.map((cell) => {
            if (cell.id === cellId) {
              return { ...cell, formula };
            }
            return cell;
          });
          return { draftCells: newCells };
        }),
        moveCellToTab: assign((context, event) => {
          const { cellId, tabId } = event.payload;
          const newCells = context.draftCells.map((cell) => {
            if (cell.id === cellId) {
              return { ...cell, component: { ...cell.component, t: tabId } };
            }
            return cell;
          });
          return { draftCells: newCells };
        }),
        updateCellStyles: assign((context, event) => {
          const { cellId, styles } = event.payload;
          const newCells = context.draftCells.map((cell) => {
            if (cell.id === cellId) {
              return { ...cell, styles: { ...cell.styles, ...styles } };
            }
            return cell;
          });
          return { draftCells: newCells };
        }),
        refetchParameters: () => {
          // delay the refetch so that the dashboard can update first
          globalEvents$$.next({ type: "DASHBOARD.PARAMETERS.REFETCH_PARAMETERS", dashboardId });
        },
      },
      services: {
        globalEvents: () => globalEvents$$,
      },
      guards: {
        isDashboard: (context, event) => {
          return event.dashboardId === dashboardId;
        },
      },
    }
  );
  return machine;
};

interface DashboardContext {
  draftCells: CellWithRef[];
  publishedCells: CellWithRef[];
}

export type DashboardGridActorRef = ActorRefFrom<ReturnType<typeof createDashboardGridMachine>>;
export type DashboardGridState = StateFrom<ReturnType<typeof createDashboardGridMachine>>;

type DashboardGridEvent =
  | {
      type: "DASHBOARD.GRID.UPDATE_LAYOUT";
      payload: { layout: Layout[] };
    }
  | {
      type: "DASHBOARD.GRID.ADD_CELL";
      payload: AddCellToDashboardArgs;
    }
  | {
      type: "DASHBOARD.GRID.REMOVE_CELL";
      payload: { cellId: string };
    }
  | {
      type: "DASHBOARD.GRID.ACTIVATE_TAB_MODE";
      payload: { activeTabId: string };
    }
  | {
      type: "DASHBOARD.GRID.REMOVE_TAB_CELLS";
      payload: { tabId: string; isLast: boolean };
    }
  | {
      type: "DASHBOARD.GRID.UPDATE_CELL_FORMULA";
      payload: {
        cellId: string;
        formula: Cell["formula"];
      };
    }
  | {
      type: "DASHBOARD.GRID.MOVE_CELL_TO_TAB";
      payload: {
        cellId: string;
        tabId: string;
      };
    }
  | {
      type: "DASHBOARD.GRID.UPDATE_STYLES";
      payload: {
        cellId: string;
        styles: Cell["styles"];
      };
    };

export interface AddCellToDashboardArgs {
  type: ComponentType;
  formula: Cell["formula"];
  position: Pick<ReactGridLayout.Layout, "x" | "y" | "w" | "h">;
  layout: ReactGridLayout.Layout[];
}

export const useDashboardGridMachine = (dashboardId: string, width: number, variant: "draft" | "published") => {
  const baseRef = actorSystem.get<DashboardActorRef>(`dashboard-${dashboardId}`);
  const dashboardRef = baseRef ?? toActorRef({ send: () => {} });
  const dashboardCellsRef = dashboardRef?.getSnapshot()?.context.dashboardGrid ?? toActorRef({ send: () => {} });

  const dashboardTabsRef = dashboardRef?.getSnapshot()?.context.dashboardTabs ?? toActorRef({ send: () => {} });

  const draftCells = useSelector(dashboardCellsRef, draftCellsSelector, deepEquals);
  const publishedCells = useSelector(dashboardCellsRef, publishedCellsSelector, deepEquals);
  const activeDraftTabId = useSelector(dashboardTabsRef, activeDraftTabIdSelector);
  const activePublishedTabId = useSelector(dashboardTabsRef, activePublishedTabIdSelector);

  const activeTabId = variant === "draft" ? activeDraftTabId : activePublishedTabId;
  const updateLayout = (layout: Layout[]) =>
    dashboardCellsRef.send({ type: "DASHBOARD.GRID.UPDATE_LAYOUT", payload: { layout } });
  const moveCellToTab = (cellId: string, tabId: string) =>
    dashboardCellsRef.send({ type: "DASHBOARD.GRID.MOVE_CELL_TO_TAB", payload: { cellId, tabId } });
  const addCell = (data: AddCellToDashboardArgs) =>
    dashboardCellsRef.send({ type: "DASHBOARD.GRID.ADD_CELL", payload: data });
  const removeCell = (cellId: string) =>
    dashboardCellsRef.send({ type: "DASHBOARD.GRID.REMOVE_CELL", payload: { cellId } });
  const cells = variant === "draft" ? draftCells : publishedCells;
  let layout = createLayout(cells, width, activeTabId) as Layout[];
  const tabCells = filterTabCells({ cells, activeTabId });
  const isReady = useSelector(dashboardCellsRef, isReadySelector);
  return {
    cells: tabCells,
    layout,
    updateLayout,
    moveCellToTab,
    addCell,
    activeTabId,
    removeCell,
    isReady,
  };
};

const draftCellsSelector = (state: DashboardGridState) => state?.context?.draftCells ?? [];
const publishedCellsSelector = (state: DashboardGridState) => state?.context?.publishedCells ?? [];
const isReadySelector = (state: DashboardGridState) => state?.matches("idle");
const activeDraftTabIdSelector = (state: DashboardTabsState) => state?.context?.activeDraftTabId;
const activePublishedTabIdSelector = (state: DashboardTabsState) => state?.context?.activePublishedTabId;
