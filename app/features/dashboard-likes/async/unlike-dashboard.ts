import { $path } from "remix-routes";
import { POST } from "~/async/fetch";

export const unlikeDashboard = async ({ id }: { id: string }) => {
  return POST($path("/api/likes/delete"), { resourceId: id, resourceType: "dashboard" });
};
