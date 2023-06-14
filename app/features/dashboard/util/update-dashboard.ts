import { $path } from "remix-routes";
import { dashboard } from "@fscrypto/domain";
import { POST } from "~/async/fetch";

export const updateDashboard = async (dashboardId: string, update: dashboard.DashboardUpdate) => {
  return POST<dashboard.Dashboard>($path("/api/dashboards/:id/update", { id: dashboardId }), update);
};
