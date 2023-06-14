import { DashboardsMachineContext } from "~/state/machines/discover/discover-dashboards";

export const createParamsFromContext = (context: DashboardsMachineContext, addPages: boolean) => {
  const params = new URLSearchParams();
  if (context.userId && addPages) {
    params.append("d_userId", context.userId);
  }
  if (context.searchTerm.length > 2) {
    params.append("d_search", context.searchTerm);
  }
  if (context.sortBy !== "trending") {
    params.append("d_sort", context.sortBy as string);
  }
  if (context.pageNumber > 1 && addPages) {
    params.append("d_page", context.pageNumber.toString());
  }
  if (context.activeProject) {
    params.append("d_project", context.activeProject);
  }
  if (context.likedByMe === true) {
    params.append("d_liked", context.likedByMe.toString());
  }
  return params.toString();
};
