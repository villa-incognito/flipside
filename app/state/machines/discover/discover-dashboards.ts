import type { ActorRefFrom, StateFrom } from "xstate";
import { createMachine, spawn, assign } from "xstate";
import type { searchDashboard, tag } from "@fscrypto/domain";
import { createParamsFromContext } from "~/features/discover/utils/createParamsFromContext";
import { DashboardCardActorRef, createDashboardCardMachine } from "~/features/discover/machines/dashboard-card";
import { actorSystem } from "~/state/system";
import { useSelector } from "@xstate/react";

interface CreateDashboardsMachineProps {
  dashboards: searchDashboard.SearchDashboard[];
  params: DashboardsMachineParams;
  userId?: string;
  projects: tag.Tag[];
  totalResults: number;
  initializeWithData?: boolean;
}

export const createDiscoverDashboardsMachine = ({
  dashboards,
  params,
  userId,
  projects,
  totalResults,
  initializeWithData = false,
}: CreateDashboardsMachineProps) => {
  return createMachine(
    {
      id: "dashboardMachine",
      tsTypes: {} as import("./discover-dashboards.typegen").Typegen0,
      schema: {
        context: {} as DashboardsMachineContext,
        events: {} as MachineTreeEvent,
      },
      context: {
        projects: projects.filter((project) => project.type === "project"),
        userId,
        dashboards: [],
        searchTerm: params.searchTerm,
        likedByMe: params.likedByMe,
        sortBy: params.sortBy,
        pageNumber: params.pageNumber,
        activeProject: params.activeProject,
        totalResults: totalResults,
        done: false,
      },
      initial: "pre-init",
      on: {
        "DISCOVER_DASHBOARDS.SET_SEARCH_TERM": {
          target: "#idle.debouncing",
          actions: ["setSearchTerm", "setParams"],
        },
      },
      states: {
        "pre-init": {
          description:
            "this machine is used in two different contexts; discover index and user dashboards. When used for user, the initial Dashboards ar passed in during machine creation.",
          always: [{ target: "idle", actions: ["initDashboardCards", "setInitialData"], cond: "initializeWithData" }],
          on: {
            "DISCOVER_DASHBOARDS.SET_INITIAL_DATA": {
              target: "post-init",
            },
          },
        },
        "post-init": {
          description: "leave a small loading phase to prevent flash of content",
          entry: ["setInitialData"],
          after: {
            0: "idle",
          },
        },
        idle: {
          id: "idle",
          on: {
            "DISCOVER_DASHBOARDS.LOAD_MORE": {
              target: "#moreData",
              actions: ["loadMore", "setParams"],
            },
            "DISCOVER_DASHBOARDS.LAZY_LOAD_MORE": {
              target: "#moreData",
              actions: ["loadMore", "setParams"],
              cond: "canBeLazyLoaded",
            },
            "DISCOVER_DASHBOARDS.SET_SORT": {
              target: "newData",
              actions: ["setSort", "setParams"],
            },
            "DISCOVER_DASHBOARDS.SET_PROJECT": {
              target: "newData",
              actions: ["setProject", "setParams"],
            },
            "DISCOVER_DASHBOARDS.SET_LIKED_BY_ME": {
              target: "newData",
              actions: ["setLikedByMe", "setParams"],
            },
          },
          states: {
            invalidForSearch: {},
            debouncing: {
              after: {
                100: [
                  {
                    target: "#newData",
                    cond: "validLength",
                  },
                  {
                    target: "#idle.invalidForSearch",
                  },
                ],
              },
            },
          },
        },
        moreData: {
          id: "moreData",
          invoke: {
            id: "fetchData",
            src: "fetchData",
            onDone: [
              {
                target: "idle",
                cond: "hasMoreResults",
                actions: "setData",
              },
              {
                target: "finished",
                actions: "setData",
              },
            ],
          },
        },
        newData: {
          id: "newData",
          invoke: {
            id: "fetchData",
            src: "fetchData",
            onDone: [
              {
                target: "empty",
                cond: "isNewDataEmpty",
                actions: "useNewData",
              },
              {
                target: "idle",
                actions: "useNewData",
              },
            ],
            onError: {
              target: "idle",
            },
          },
        },
        empty: {
          on: {
            "DISCOVER_DASHBOARDS.SET_SORT": {
              target: "newData",
              actions: ["setSort", "setParams"],
            },
            "DISCOVER_DASHBOARDS.SET_PROJECT": {
              target: "newData",
              actions: ["setProject", "setParams"],
            },
            "DISCOVER_DASHBOARDS.SET_LIKED_BY_ME": {
              target: "newData",
              actions: ["setLikedByMe", "setParams"],
            },
          },
        },
        finished: {
          on: {
            "DISCOVER_DASHBOARDS.SET_SORT": {
              target: "newData",
              actions: ["setSort", "setParams"],
            },
            "DISCOVER_DASHBOARDS.SET_PROJECT": {
              target: "newData",
              actions: ["setProject", "setParams"],
            },
            "DISCOVER_DASHBOARDS.SET_LIKED_BY_ME": {
              target: "newData",
              actions: ["setLikedByMe", "setParams"],
            },
          },
        },
      },
    },
    {
      actions: {
        setInitialData: assign((_context, event) => {
          if (event.type === "DISCOVER_DASHBOARDS.SET_INITIAL_DATA") {
            return {
              dashboards: createDashboardCardMachines(event.dashboards),
              totalResults: event.totalResults,
              projects: event.projects,
              activeProject: event.params.activeProject,
              sortBy: event.params.sortBy,
              pageNumber: event.params.pageNumber,
              searchTerm: event.params.searchTerm,
              likedByMe: event.params.likedByMe,
            };
          }
          return {};
        }),
        setSearchTerm: assign((context, event) => {
          return {
            searchTerm: event.value,
            pageNumber: 1,
          };
        }),
        setParams: (context) => {
          const params = createParamsFromContext(context, false);
          const newUrl = [window.location.pathname, params].filter(Boolean).join("?");
          window.history.replaceState({ ...window.history.state, idx: window.history.state.idx ?? 0 }, "", newUrl);
        },
        setData: assign((context, event) => {
          const dashboards = {
            dashboards: [...context.dashboards, ...createDashboardCardMachines(event.data.dashboards)],
            totalResults: event.data.totalResults,
          };
          return dashboards;
        }),
        useNewData: assign((_context, event) => {
          return {
            dashboards: createDashboardCardMachines(event.data.dashboards),
            totalResults: event.data.totalResults,
          };
        }),
        setSort: assign((context, event) => {
          return {
            sortBy: event.sortBy,
            pageNumber: 1,
          };
        }),
        setProject: assign((context, event) => {
          return {
            activeProject: event.name === "all" ? undefined : event.name,
            pageNumber: 1,
          };
        }),
        setLikedByMe: assign((context, event) => {
          return {
            likedByMe: event.value,
            pageNumber: 1,
          };
        }),
        loadMore: assign((context) => {
          return {
            pageNumber: context.pageNumber + 1,
          };
        }),
        initDashboardCards: assign((_) => {
          return {
            dashboards: createDashboardCardMachines(dashboards),
          };
        }),
      },
      services: {
        fetchData: (context) => {
          const searchParams = createParamsFromContext(context, true);
          const url = window.location.protocol + "//" + window.location.host + "/api/discover/get?" + searchParams;

          return fetch(url, {
            method: "get",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => response.json());
        },
      },
      guards: {
        initializeWithData: () => {
          return initializeWithData;
        },
        isNewDataEmpty: (context, event) => {
          return event.data.totalResults === 0;
        },
        hasMoreResults: (context, event) => {
          return context.totalResults > event.data.dashboards.length + context.dashboards.length;
        },
        validLength: (context) => {
          return context.searchTerm.length === 0 || context.searchTerm.length > 2;
        },
        canBeLazyLoaded: (context) => {
          return context.pageNumber % 3 !== 0;
        },
      },
    }
  );
};

export interface DashboardsMachineContext {
  projects: tag.Tag[];
  activeProject?: string;
  userId?: string;
  dashboards: (searchDashboard.SearchDashboard & { ref: DashboardCardActorRef })[];
  searchTerm: string;
  likedByMe: boolean;
  sortBy: searchDashboard.SearchDashboardQuery["sortBy"];
  pageNumber: number;
  totalResults: number;
  done: boolean;
}

type MachineTreeEvent =
  | {
      type: "DISCOVER_DASHBOARDS.SET_INITIAL_DATA";
      dashboards: searchDashboard.SearchDashboard[];
      projects: tag.Tag[];
      params: DashboardsMachineParams;
      totalResults: number;
    }
  | {
      type: "DISCOVER_DASHBOARDS.LOAD_MORE";
    }
  | {
      type: "DISCOVER_DASHBOARDS.LAZY_LOAD_MORE";
    }
  | {
      type: "DISCOVER_DASHBOARDS.SET_SORT";
      sortBy: searchDashboard.SearchDashboardQuery["sortBy"];
    }
  | {
      type: "DISCOVER_DASHBOARDS.SET_PROJECT";
      name: string;
    }
  | {
      type: "DISCOVER_DASHBOARDS.SET_LIKED_BY_ME";
      value: boolean;
    }
  | {
      type: "DISCOVER_DASHBOARDS.SET_SEARCH_TERM";
      value: string;
    }
  | {
      type: "DISCOVER_DASHBOARDS.FILTER.SELECT_TAG";
      tag: string;
    }
  | {
      type: "done.invoke.fetchData";
      data: { dashboards: searchDashboard.SearchDashboard[]; totalResults: number };
    };

export const initialDiscoverDashboardsData: CreateDashboardsMachineProps = {
  projects: [],
  userId: undefined,
  params: {
    searchTerm: "",
    sortBy: "trending",
    pageNumber: 1,
    likedByMe: false,
  },
  dashboards: [],
  totalResults: 0,
};

const createDashboardCardMachines = (dashboards: searchDashboard.SearchDashboard[]) => {
  return dashboards.map((dashboard) => ({
    ...dashboard,
    ref: spawn(createDashboardCardMachine({ dashboard })),
  }));
};

export type DashboardsMachineParams = {
  searchTerm: string;
  sortBy: searchDashboard.SearchDashboardQuery["sortBy"];
  pageNumber: number;
  activeProject?: string;
  likedByMe: boolean;
};

export type DiscoverDashboardsActorRef = ActorRefFrom<ReturnType<typeof createDiscoverDashboardsMachine>>;
type DiscoverDashboardsState = StateFrom<ReturnType<typeof createDiscoverDashboardsMachine>>;

type SetInitialDataArgs = {
  dashboards: searchDashboard.SearchDashboard[];
  projects: tag.Tag[];
  params: DashboardsMachineParams;
  totalResults: number;
};

export const useDiscoverDashboards = (dashboardRef?: DiscoverDashboardsActorRef) => {
  //if the actor is passed, we assume it's from user dashboards and use that instead of the global one
  const discoverDashboardsRef = dashboardRef || actorSystem.get<DiscoverDashboardsActorRef>("discoverDashboards")!;
  const dashboards = useSelector(discoverDashboardsRef, dashboardsSelector);
  const projects = useSelector(discoverDashboardsRef, projectsSelector);
  return {
    dashboards,
    projects,
    setInitialData: ({ dashboards, projects, totalResults, params }: SetInitialDataArgs) =>
      discoverDashboardsRef.send({
        type: "DISCOVER_DASHBOARDS.SET_INITIAL_DATA",
        dashboards,
        projects,
        totalResults,
        params,
      }),
    searchTerm: useSelector(discoverDashboardsRef, searchTermSelector),
    activeProject: useSelector(discoverDashboardsRef, activeProjectSelector),
    sortBy: useSelector(discoverDashboardsRef, sortBySelector),
    likedByMe: useSelector(discoverDashboardsRef, likedByMeSelector),
    setSearchTerm: (value: string) =>
      discoverDashboardsRef.send({ type: "DISCOVER_DASHBOARDS.SET_SEARCH_TERM", value }),
    setSort: (sortBy: searchDashboard.SearchDashboardQuery["sortBy"]) =>
      discoverDashboardsRef.send({ type: "DISCOVER_DASHBOARDS.SET_SORT", sortBy }),
    setProject: (name: string) => discoverDashboardsRef.send({ type: "DISCOVER_DASHBOARDS.SET_PROJECT", name }),
    setLikedByMe: (value: boolean) =>
      discoverDashboardsRef.send({ type: "DISCOVER_DASHBOARDS.SET_LIKED_BY_ME", value }),
    loadMore: () => discoverDashboardsRef.send({ type: "DISCOVER_DASHBOARDS.LOAD_MORE" }),
    lazyLoadMore: () => discoverDashboardsRef.send({ type: "DISCOVER_DASHBOARDS.LAZY_LOAD_MORE" }),
    isLoading: useSelector(discoverDashboardsRef, isLoadingSelector),
    isEmpty: useSelector(discoverDashboardsRef, isEmptySelector),
    isFinished: useSelector(discoverDashboardsRef, isFinishedSelector),
    hasMoreData: useSelector(discoverDashboardsRef, hasMoreDataSelector),
  };
};

const dashboardsSelector = (state: DiscoverDashboardsState) => state.context.dashboards;
const projectsSelector = (state: DiscoverDashboardsState) => state.context.projects;
const searchTermSelector = (state: DiscoverDashboardsState) => state.context.searchTerm;
const sortBySelector = (state: DiscoverDashboardsState) => state.context.sortBy;
const likedByMeSelector = (state: DiscoverDashboardsState) => state.context.likedByMe;
const activeProjectSelector = (state: DiscoverDashboardsState) => state.context.activeProject;
const isLoadingSelector = (state: DiscoverDashboardsState) => state.matches("pre-init") || state.matches("post-init");
const isEmptySelector = (state: DiscoverDashboardsState) => state.matches("empty");
const hasMoreDataSelector = (state: DiscoverDashboardsState) => state.matches("moreData");
const isFinishedSelector = (state: DiscoverDashboardsState) => state.matches("finished");
