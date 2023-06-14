import type { searchDashboard, tag } from "@fscrypto/domain";
import type { LoaderArgs } from "@remix-run/node";
import Dashboards from "~/features/discover/dashboards";
import { useLoaderData } from "~/remix";
import { getDashboardLikesAndProjectsPromise } from "~/features/discover/utils/get-dashboards-promise.server";
import { useEffect } from "react";
import { useSearchParams } from "@remix-run/react";
import { DashboardsMachineParams, useDiscoverDashboards } from "~/state/machines/discover/discover-dashboards";
import isbot from "isbot";

export const loader = async ({ context, request }: LoaderArgs) => {
  if (isbot(request.headers.get("user-agent"))) {
    return { data: { searchResults: [], projects: [], totalResults: 0 } };
  }
  const dataPromise = await getDashboardLikesAndProjectsPromise({ context, request });
  return { data: dataPromise };
};

type Results = {
  searchResults: searchDashboard.SearchDashboard[];
  projects: tag.Tag[];
  totalResults: number;
};

const DiscoverRoute = () => {
  useLoadDiscoverDashboardsData();
  return <Dashboards />;
};

export const shouldRevalidate = () => {
  return false;
};

export default DiscoverRoute;

const useLoadDiscoverDashboardsData = () => {
  let [searchParams] = useSearchParams();
  const params = getValuesFromParams(searchParams);
  const { data } = useLoaderData<{ data: Results }>();
  const { searchResults, projects, totalResults } = data;
  const { setInitialData } = useDiscoverDashboards();
  useEffect(() => {
    setInitialData({ dashboards: searchResults, projects, totalResults, params });
  }, []);
};

export const getValuesFromParams = (searchParams: URLSearchParams): DashboardsMachineParams => {
  const params = Object.fromEntries(searchParams);
  const { d_sort, d_search, d_page, d_project, d_liked } = params;
  return {
    searchTerm: d_search || "",
    sortBy: d_sort === "new" ? "new" : "trending",
    pageNumber: d_page ? parseInt(d_page) : 1,
    activeProject: d_project,
    likedByMe: d_liked === "true",
  };
};
