import { Dashboard } from "@fscrypto/domain/src/dashboard";
import { useSelector } from "@xstate/react";
import { ActorRefFrom, StateFrom, assign, createMachine, toActorRef } from "xstate";
import deepEquals from "fast-deep-equal";
import { dashboard as dashboardDomain } from "@fscrypto/domain";
import { actorSystem } from "~/state/system";
import { spawnInitialMachines } from "./util/spawn-initial-machines";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { PersistDataActorRef, PersistDataState } from "./dashboard-data/dashboard-persist-data.machine";
import { DashboardGridActorRef } from "./dashboard-grid/dashboard-grid.machine";
import { DashboardTabsActorRef } from "./dashboard-tabs/dashboard-tabs.machine";
import { DashboardPublishActorRef } from "./dashboard-publish-controls/dashboard-publish-controls.machine";
import { DashboardParametersActorRef } from "./dashboard-parameters/dashboard-parameters.machine";
import { DashboardRefreshActorRef } from "./dashboard-toolbar/dashboard-refresh.machine";

export const createDashboardMachine = (dashboard: Dashboard) => {
  const machine = createMachine(
    {
      id: "dashboardMachine",
      tsTypes: {} as import("./dashboard.machine.typegen").Typegen0,
      predictableActionArguments: true,
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      schema: {
        context: {} as DashboardContext,
        events: {} as GlobalEvent,
      },
      context: {
        dashboard,
        persistDashboardData: null,
        dashboardGrid: null,
        dashboardTabs: null,
        dashboardPublish: null,
        dashboardParameters: null,
        dashboardRefresh: null,
      },
      initial: "initializingDashboardMachines",
      states: {
        initializingDashboardMachines: {
          description: "this state is used to spawn all the sub-machines for the dashboard",
          always: {
            target: "ready",
            actions: "initializeDashboardMachines",
          },
        },
        ready: {
          description: "this state is entered when all of the dashboard sub-machines are created",
        },
      },
      on: {
        "DASHBOARD.SET_TITLE": {
          actions: ["setTitle", "persistDashboardData"],
          cond: "isDashboardId",
        },
        "DASHBOARD.SET_DATA": {
          actions: ["setDashboardData", "persistDashboardData"],
          cond: "isDashboardId",
        },
        "DASHBOARD.UPDATE_SUCCESS": {
          actions: ["setUpdatedAt"],
          cond: "isDashboardId",
        },
        "DASHBOARD.PUBLISH.PUBLISH_SUCCESS": {
          actions: ["setPublishedDate"],
          cond: "isDashboardId",
        },
        "DASHBOARD.PUBLISH.UNPUBLISH_SUCCESS": {
          actions: ["setUnpublishedDate"],
          cond: "isDashboardId",
        },
        "WORK_ITEM.UPDATE_REQUEST": {
          actions: ["externalSetTitle"],
          cond: "isWorkItemId",
        },
        "WORK_ITEM.UPDATE_SUCCESS": {
          actions: ["externalSetUpdatedAt"],
          cond: "isWorkItemId",
        },
        "WORK_ITEM.MOVE_REQUEST": {
          actions: ["externalSetCollectionId"],
          cond: "isWorkItemId",
        },
        "WORK_ITEM.MOVE_SUCCESS": {
          actions: ["externalSetUpdatedAt"],
          cond: "isWorkItemId",
        },
        "ADD_TO_DASHBOARD.ADD_CELL": {
          actions: ["externalSetUpdatedAt"],
          cond: "isDashboardId",
        },
        "DASHBOARD.REFRESH.REFRESH_FINISHED": {
          actions: ["setRefreshedAt"],
          cond: "isDashboardId",
        },
      },
    },
    {
      actions: {
        externalSetTitle: assign((context, event) => {
          return {
            dashboard: { ...context.dashboard, title: event.payload.name },
          };
        }),
        externalSetCollectionId: assign((context, event) => {
          return {
            dashboard: { ...context.dashboard, collectionId: event.payload.parentId },
          };
        }),
        externalSetUpdatedAt: assign((context, event) => {
          return {
            dashboard: { ...context.dashboard, updatedAt: event.payload.updatedAt },
          };
        }),
        setTitle: assign((context, event) => {
          return {
            dashboard: { ...context.dashboard, title: event.payload },
          };
        }),
        setDashboardData: assign((context, event) => {
          return {
            dashboard: { ...context.dashboard, ...event.payload.dashboard },
          };
        }),
        setUpdatedAt: assign((context, event) => {
          return {
            dashboard: { ...context.dashboard, updatedAt: event.payload.dashboard.updatedAt },
          };
        }),
        setRefreshedAt: assign((context, event) => {
          return {
            dashboard: {
              ...context.dashboard,
              lastRefreshedAt: event.payload.dashboard.lastRefreshedAt,
              updatedAt: new Date(event.payload.dashboard.updatedAt),
            },
          };
        }),
        setPublishedDate: assign((context, event) => {
          return {
            dashboard: {
              ...context.dashboard,
              publishedAt: event.payload.publishedAt,
              updatedAt: event.payload.updatedAt,
            },
          };
        }),
        setUnpublishedDate: assign((context, event) => {
          return {
            dashboard: {
              ...context.dashboard,
              publishedAt: null,
              updatedAt: event.payload.updatedAt,
            },
          };
        }),
        // -----> This creates all the various sub-machines for the dashboard
        initializeDashboardMachines: assign((_) => spawnInitialMachines(dashboard)),
        persistDashboardData: (context) => {
          dashboardDomain.updateSchema.parse(context.dashboard);
          globalEvents$$.next({
            type: "DASHBOARD.UPDATE_REQUEST",
            payload: { dashboard: context.dashboard },
            dashboardId: context.dashboard.id,
          });
        },
      },
      services: {
        globalEvents: () => globalEvents$$,
      },
      guards: {
        isDashboardId: (context, event) => {
          return event.dashboardId === context.dashboard.id;
        },
        isWorkItemId: (context, event) => {
          return context.dashboard.id === event.id;
        },
      },
    }
  );
  return machine;
};

interface DashboardContext {
  dashboard: Dashboard;
  persistDashboardData: PersistDataActorRef | null;
  dashboardGrid: DashboardGridActorRef | null;
  dashboardTabs: DashboardTabsActorRef | null;
  dashboardPublish: DashboardPublishActorRef | null;
  dashboardParameters: DashboardParametersActorRef | null;
  dashboardRefresh: DashboardRefreshActorRef | null;
}

export type DashboardActorRef = ActorRefFrom<ReturnType<typeof createDashboardMachine>>;
export type DashboardState = StateFrom<ReturnType<typeof createDashboardMachine>>;

export type DashboardEvent =
  | {
      type: "DASHBOARD.SET_TITLE";
      payload: string;
      dashboardId: string;
    }
  | {
      type: "DASHBOARD.SET_DATA";
      payload: {
        dashboard: Partial<Dashboard>;
      };
      dashboardId: string;
    }
  | {
      type: "DASHBOARD.UPDATE_REQUEST";
      payload: {
        dashboard: Dashboard;
      };
      dashboardId: string;
    }
  | {
      type: "DASHBOARD.UPDATE_SUCCESS";
      payload: {
        dashboard: Dashboard;
      };
      dashboardId: string;
    }
  | {
      type: "DASHBOARD.DELETE_REQUEST";
      dashboardId: string;
    }
  | {
      type: "DASHBOARD.RESET_PANELS";
      payload: {
        dashboardId: string;
      };
    };

export const useDashboard = (id: string) => {
  const baseRef = actorSystem.get<DashboardActorRef>(`dashboard-${id}`);
  const dashboardRef = baseRef ?? toActorRef({ send: () => {} });
  const persistDashboardDataRef =
    dashboardRef?.getSnapshot()?.context.persistDashboardData ?? toActorRef({ send: () => {} });

  const dashboard = useSelector(dashboardRef, dashboardDataSelector, isDashboardDataEqual);
  const updateDashboard = (dashboard: Partial<Dashboard>) =>
    globalEvents$$.next({ type: "DASHBOARD.SET_DATA", payload: { dashboard }, dashboardId: id });

  const updateTitle = (title: string) =>
    globalEvents$$.next({ type: "DASHBOARD.SET_TITLE", payload: title, dashboardId: dashboard.id });

  const deleteDashboard = () => globalEvents$$.next({ type: "DASHBOARD.DELETE_REQUEST", dashboardId: id });

  const isSaving = useSelector(persistDashboardDataRef, isSavingSelector);

  if (!baseRef) {
    return undefined;
  }
  return { dashboard, updateDashboard, isSaving, deleteDashboard, updateTitle };
};

const isSavingSelector = (state: PersistDataState) => {
  return state?.matches("saving") ?? false;
};

const dashboardDataSelector = (state: DashboardState) => {
  return state?.context?.dashboard;
};
const isDashboardDataEqual = (a: Dashboard, b: Dashboard) => {
  return deepEquals(a, b);
};
