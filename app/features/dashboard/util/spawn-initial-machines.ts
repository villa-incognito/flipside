import { spawn } from "xstate";
import { createPersistDataMachine } from "../dashboard-data/dashboard-persist-data.machine";
import { createDashboardGridMachine } from "../dashboard-grid/dashboard-grid.machine";
import { Dashboard } from "@fscrypto/domain/src/dashboard";
import { createDashboardTabsMachine } from "../dashboard-tabs/dashboard-tabs.machine";
import { createDashboardPublishControlsMachine } from "../dashboard-publish-controls/dashboard-publish-controls.machine";
import { createParametersMachine } from "../dashboard-parameters/dashboard-parameters.machine";
import { createRefreshMachine } from "../dashboard-toolbar/dashboard-refresh.machine";

export const spawnInitialMachines = (dashboard: Dashboard) => {
  return {
    persistDashboardData: spawn(createPersistDataMachine(dashboard.id)),
    dashboardGrid: spawn(
      createDashboardGridMachine(dashboard.draft.cells, dashboard.published?.cells ?? [], dashboard.id)
    ),
    dashboardTabs: spawn(
      createDashboardTabsMachine({
        tabs: dashboard.draft.tabs ?? [],
        id: dashboard.id,
        publishedTabs: dashboard.published?.tabs ?? [],
      })
    ),
    dashboardPublish: spawn(createDashboardPublishControlsMachine(dashboard.publishedAt, dashboard.id)),
    dashboardParameters: spawn(createParametersMachine({ dashboardId: dashboard.id })),
    dashboardRefresh: spawn(
      createRefreshMachine({
        queries: dashboard.queries.map((query) => ({ id: query.id, statement: query.statement })),
        dashboardId: dashboard.id,
        lastRefreshedAt: dashboard.lastRefreshedAt ? new Date(dashboard.lastRefreshedAt) : undefined,
      })
    ),
  };
};
