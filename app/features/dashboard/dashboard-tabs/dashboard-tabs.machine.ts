import { DashboardTab } from "@fscrypto/domain/src/dashboard";
import { useSelector } from "@xstate/react";
import { nanoid } from "nanoid";
import { ActorRefFrom, StateFrom, assign, createMachine, spawn, toActorRef } from "xstate";
import { actorSystem } from "~/state";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { DashboardTabActorRef, createTabMachine } from "./dashboard-tab.machine";
import { DashboardActorRef } from "../dashboard.machine";

interface CreateTabsMachineProps {
  tabs: DashboardTab[];
  id: string;
  publishedTabs: DashboardTab[];
}

export const createDashboardTabsMachine = ({ tabs, id, publishedTabs }: CreateTabsMachineProps) => {
  const machine = createMachine(
    {
      id: "dashboardTabsMachine",
      tsTypes: {} as import("./dashboard-tabs.machine.typegen").Typegen0,
      schema: {
        context: {} as DashboardTabsContext,
        events: {} as DashboardTabsEvent | GlobalEvent,
      },
      predictableActionArguments: true,
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        activeDraftTabId: undefined,
        activePublishedTabId: undefined,
        draftTabs: [] as TabWithRef[],
        publishedTabs: [] as TabWithRef[],
      },
      initial: "initializingTabs",
      states: {
        initializingTabs: {
          always: [{ actions: ["setInitialTabs"], target: "ready" }],
        },
        ready: {
          on: {
            "DASHBOARD.TABS.ACTIVATE_TABS": {
              actions: ["createTab", "activateTabs", "persistTabs"],
            },
            "DASHBOARD.TABS.CREATE_TAB": {
              actions: ["createTab", "persistTabs"],
            },
            "DASHBOARD.TABS.SET_ACTIVE_TAB_ID": {
              actions: ["setActiveTabId"],
            },
            "DASHBOARD.TABS.REORDER_ITEMS": {
              actions: ["reorderItems", "persistTabs"],
            },
            "DASHBOARD.TABS.UPDATE_TAB": {
              actions: ["updateTab", "persistTabs"],
            },
            "DASHBOARD.TABS.REMOVE_TAB": {
              actions: ["removeTab", "removeCells", "persistTabs"],
            },
            "DASHBOARD.PUBLISH.PUBLISH_SUCCESS": {
              description:
                "When a dashboard is published, we want to save the current draft cells as the published cells",
              actions: ["createPublishedTabs"],
            },
          },
        },
      },
    },
    {
      services: {
        globalEvents: () => globalEvents$$,
      },
      actions: {
        setActiveTabId: assign((context, event) => ({
          [event.variant === "draft" ? "activeDraftTabId" : "activePublishedTabId"]: event.id,
        })),
        setInitialTabs: assign((_) => {
          const initTabs = (sourceTabs: DashboardTab[]) =>
            sourceTabs.map((tab) => ({ ...tab, ref: spawn(createTabMachine({ ...tab })) }));

          const draft = initTabs(tabs);
          const published = initTabs(publishedTabs);

          return {
            draftTabs: draft,
            activeDraftTabId: draft[0]?.id,
            publishedTabs: published,
            activePublishedTabId: published[0]?.id,
          };
        }),
        activateTabs: (context) => {
          const dashboardCellsRef = actorSystem.get<DashboardActorRef>(`dashboard-${id}`)?.getSnapshot()
            ?.context?.dashboardGrid;
          if (dashboardCellsRef) {
            dashboardCellsRef.send({
              type: "DASHBOARD.GRID.ACTIVATE_TAB_MODE",
              payload: {
                activeTabId: context.activeDraftTabId!,
              },
            });
          }
        },
        removeCells: (context, event) => {
          const dashboardCellsRef = actorSystem.get<DashboardActorRef>(`dashboard-${id}`)?.getSnapshot()
            ?.context?.dashboardGrid;
          if (dashboardCellsRef) {
            dashboardCellsRef.send({
              type: "DASHBOARD.GRID.REMOVE_TAB_CELLS",
              payload: {
                tabId: event.id,
                isLast: context.draftTabs.length === 0,
              },
            });
          }
        },
        persistTabs: (context) => {
          const currentDashboard = actorSystem.get<DashboardActorRef>(`dashboard-${id}`)?.getSnapshot()
            ?.context?.dashboard;
          if (currentDashboard) {
            const { draft } = currentDashboard;
            globalEvents$$.next({
              type: "DASHBOARD.SET_DATA",
              payload: {
                dashboard: {
                  draft: { ...draft, tabs: context.draftTabs.map(({ id, url, title }) => ({ id, url, title })) },
                },
              },
              dashboardId: id,
            });
          }
        },
        createTab: assign((context) => {
          const newId = nanoid(6);
          const newTabData = {
            title: "New Tab",
            url: "",
            id: newId,
          };
          return {
            activeDraftTabId: newId,
            draftTabs: [...context.draftTabs, { ...newTabData, ref: spawn(createTabMachine({ ...newTabData })) }],
          };
        }),
        reorderItems: assign((context, event) => {
          const { ids } = event;
          const newTabs = ids.map((id) => context.draftTabs.find((tab) => tab.id === id));
          return {
            draftTabs: newTabs as TabWithRef[],
          };
        }),
        updateTab: assign((context, event) => {
          const newTabs = context.draftTabs.map((tab) => {
            if (tab.id !== event.payload.tab.id) return tab;
            return {
              ...tab,
              ...event.payload.tab,
            };
          });
          return {
            draftTabs: newTabs,
          };
        }),
        removeTab: assign((context, event) => {
          const newTabs = context.draftTabs.filter((tab) => tab.id !== event.id);
          const newId =
            event.id === context.activeDraftTabId ? newTabs[newTabs.length - 1]?.id : context.activeDraftTabId;
          return {
            draftTabs: newTabs,
            activeDraftTabId: newId,
          };
        }),
        createPublishedTabs: assign((context) => {
          const newTabs = context.draftTabs.map(({ id, url, title }) => ({
            id,
            url,
            title,
            ref: spawn(createTabMachine({ id, url, title })),
          }));
          return {
            publishedTabs: newTabs,
            activePublishedTabId: newTabs[0]?.id,
          };
        }),
      },
    }
  );
  return machine;
};

export type TabWithRef = DashboardTab & { ref: DashboardTabActorRef };

interface DashboardTabsContext {
  activeDraftTabId?: string;
  draftTabs: TabWithRef[];
  publishedTabs: TabWithRef[];
  activePublishedTabId?: string;
}

export type DashboardTabsActorRef = ActorRefFrom<ReturnType<typeof createDashboardTabsMachine>>;
export type DashboardTabsState = StateFrom<ReturnType<typeof createDashboardTabsMachine>>;

type DashboardTabsEvent =
  | {
      type: "DASHBOARD.EVENT";
    }
  | {
      type: "DASHBOARD.TABS.ACTIVATE_TABS";
    }
  | {
      type: "DASHBOARD.TABS.CREATE_TAB";
    }
  | {
      type: "DASHBOARD.TABS.SET_ACTIVE_TAB_ID";
      id: string;
      variant: "draft" | "published";
    }
  | {
      type: "DASHBOARD.TABS.REORDER_ITEMS";
      ids: string[];
    }
  | {
      type: "DASHBOARD.TABS.UPDATE_TAB";
      payload: {
        tab: DashboardTab;
      };
    }
  | {
      type: "DASHBOARD.TABS.REMOVE_TAB";
      id: string;
    };

export const useDashboardTabsMachine = (id: string, variant: "draft" | "published") => {
  const dashboardTabsRef =
    actorSystem.get<DashboardActorRef>(`dashboard-${id}`)?.getSnapshot()?.context.dashboardTabs ??
    toActorRef({ send: () => {} });

  const activeDraftTabId = useSelector(dashboardTabsRef, activeDraftIdSelector);
  const activePublishedTabId = useSelector(dashboardTabsRef, activePublishedIdSelector);

  // Set activeTabId based on variant
  const activeTabId = variant === "draft" ? activeDraftTabId : activePublishedTabId;

  const draftTabs = useSelector(dashboardTabsRef, draftTabsSelector);
  const publishedTabs = useSelector(dashboardTabsRef, publishedTabsSelector);

  const tabs = variant === "draft" ? draftTabs : publishedTabs;

  return {
    tabs,
    publishedTabs: useSelector(dashboardTabsRef, publishedTabsSelector),
    activeTabId,
    activateTabMode: () => dashboardTabsRef.send({ type: "DASHBOARD.TABS.ACTIVATE_TABS" }),
    createTab: () => dashboardTabsRef.send({ type: "DASHBOARD.TABS.CREATE_TAB" }),
    setActiveTabId: (id: string) => dashboardTabsRef.send({ type: "DASHBOARD.TABS.SET_ACTIVE_TAB_ID", id, variant }),
    reorderItems: (ids: string[]) => dashboardTabsRef.send({ type: "DASHBOARD.TABS.REORDER_ITEMS", ids }),
    activePublishedTabId: useSelector(dashboardTabsRef, activePublishedIdSelector),
  };
};

const draftTabsSelector = (state: DashboardTabsState) => state?.context.draftTabs ?? [];
const activeDraftIdSelector = (state: DashboardTabsState) => state?.context.activeDraftTabId ?? undefined;
const publishedTabsSelector = (state: DashboardTabsState) => state?.context.publishedTabs ?? [];
const activePublishedIdSelector = (state: DashboardTabsState) => state?.context.activePublishedTabId ?? undefined;
