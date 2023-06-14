import { ActorRefFrom, assign, spawn, createMachine, StateFrom } from "xstate";
import { actorSystem } from "~/state/system";
import { Dashboard } from "@fscrypto/domain/src/dashboard";
import { useSelector } from "@xstate/react";
import { DashboardActorRef, createDashboardMachine } from "~/features/dashboard/dashboard.machine";
import { globalEvents$$ } from "~/state/events";

export const createDashboardsMachine = () => {
  const DashboardsMachine = createMachine(
    {
      id: "dashboards",
      predictableActionArguments: true,
      tsTypes: {} as import("./dashboards.typegen").Typegen0,
      schema: {
        context: {} as DashboardsContext,
        events: {} as DashboardsEvent,
      },
      context: {
        dashboards: [],
      },
      on: {
        "DASHBOARDS.ADD": {
          actions: ["addDashboard"],
        },
      },
      initial: "idle",
      states: {
        idle: {},
      },
    },
    {
      actions: {
        addDashboard: assign((ctx, event) => {
          const { dashboard } = event.payload;
          const existing = ctx.dashboards.find((q) => q.getSnapshot()!.context.dashboard.id === dashboard.id);
          if (existing) {
            // If the dashboard already exists, reset any cells that already have data
            globalEvents$$.next({ type: "DASHBOARD.RESET_PANELS", payload: { dashboardId: dashboard.id } });
            return {};
          }
          const dashboardRef = spawn(createDashboardMachine(dashboard), {
            sync: true,
            name: `dashboard-${dashboard.id}`,
          });
          actorSystem.register(dashboardRef, `dashboard-${dashboard.id}`);
          return {
            dashboards: [...ctx.dashboards, dashboardRef],
          };
        }),
      },
    }
  );

  return DashboardsMachine;
};

interface DashboardsContext {
  dashboards: DashboardActorRef[];
}

type DashboardsEvent = { type: "DASHBOARDS.ADD"; payload: { dashboard: Dashboard; isEditable: boolean } };

export type DashboardsActorRef = ActorRefFrom<ReturnType<typeof createDashboardsMachine>>;
export type DashboardsState = StateFrom<ReturnType<typeof createDashboardsMachine>>;

export const useDashboards = () => {
  const ref = actorSystem.get<DashboardsActorRef>("dashboards")!;
  return {
    dashboards: useSelector(ref, dashboardsSelector),
    initializeDashboard: (dashboard: Dashboard, isEditable: boolean) =>
      ref.send({ type: "DASHBOARDS.ADD", payload: { dashboard, isEditable } }),
  };
};

const dashboardsSelector = (state: DashboardsState) =>
  state.context.dashboards.map((q) => q.getSnapshot()!.context.dashboard);
