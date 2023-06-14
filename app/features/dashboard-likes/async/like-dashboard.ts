import { $path } from "remix-routes";
import { POST } from "~/async/fetch";

export const likeDashboard = async ({ id }: { id: string }) => {
  return POST($path("/api/likes/create"), { resourceId: id, resourceType: "dashboard" });
};
