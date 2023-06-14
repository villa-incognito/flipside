import { createMachine, ActorRefFrom, assign, StateFrom, raise } from "xstate";
import { getFileTypeAndIdFromUrl } from "../utils/get-file-type-and-id-from-url";
import { getExplorerTabUrl } from "../utils/get-explorer-tab-url";
import { actorSystem } from "~/state";
import { useSelector } from "@xstate/react";
import { WorkItem, WorkItemType } from "@fscrypto/domain/src/work-item";
import { getTabs } from "../async/get-tabs";
import { setTabs } from "../async/set-tabs";
import { uniqBy } from "lodash";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { WorkItemsActorRef } from "~/state/machines/work-items/work-items";

export const createExplorerTabsMachine = () => {
  const machine =
    /** @xstate-layout N4IgpgJg5mDOIC5QFEAeAHANgewE5lwBUBDAI1gDoBLAOyoBcrjMqAvMAYgDEBJAOR4BlABLIAIgH0AMgHkAgmP4BxCXIAKaiWLmE5AbQAMAXUSh02WAyrYapkKkQBmAGwUAnI4CsbgCy+AHAY+zo4eADQgAJ6IAEwA7J4UBl4xjgCMzp7+bp4xbnEAvgURaFh4BCTk1BCYnABKyDJ1Ysh1EroAQoKGJkgg5paMNnYOCD5pbhSOcT7+mf5pcTHOMZ4R0Qie3hSZMWm5aXuOBgtFJRg4+ERklFQ19cgAsjIAasjtch09dgNWw32jOJpNIUfyeEIzZwrYH+OLrWJpfwUGbBZbOCaeIKLM4gUqXCo3aq1DgNZ5vD5fNK9MwWP62AFODxTHxeHJpWahdnwhD7VzOQKwxHONwxHwzTw4vHla5VO7EhSSTrfPq-Ib00CAuKTdn+eLLWE+NHcraTXYZGIGfaCiU4mjYCBwOxSq6VeAq2lqkaIAC0wKSzh8BkxngxLgMzjhUUQwooiJOAcOBgMkJt5zKLsJtCszDYYB+Hus6vsiB8iXBAYSKyDOUc-m5i21-nGGUWgYj-klF2lrqJefdg0LXoQIUm2XDjnSwo8jhi3NmBljQP8c32bnNjh8RSKQA */
    createMachine(
      {
        id: "ExplorerTabs",
        predictableActionArguments: true,
        tsTypes: {} as import("./explorer-tabs-machine.typegen").Typegen0,
        schema: {
          context: {} as ExplorerTabsContext,
          events: {} as ExplorerTabsEvent | GlobalEvent,
        },
        invoke: {
          id: "global-events",
          src: "globalEvents",
        },
        context: {
          tabs: [],
        },
        initial: "fetching",
        on: {
          "EXPLORER_TABS.UPDATE_TABS": {
            actions: ["updateTabs"],
          },
          "EXPLORER_TABS.ADD_INITIAL_TAB": {
            actions: ["addInitialTab"],
          },
          "WORK_ITEMS.REMOVE": {
            description:
              "This is a global event that is fired when a work item is removed from the work item list. This is used to remove the tab if it is present.",
            actions: ["globalRemoveTab"],
          },
          "WORK_ITEMS.REMOVE_MANY": [
            {
              description:
                "This is a gloabl event that is fired when a work item is removed from the work item list. This is used to remove the tab if it is present.",
              actions: ["removeManyTabs", "navigateToLastTab"],
              cond: "containsActiveTab",
            },
            {
              actions: ["removeManyTabs"],
            },
          ],
          "EXPLORER_TABS.REMOVE_TAB": [
            {
              target: "debounce",
              actions: ["removeTab"],
              cond: "isNotActiveTab",
            },
            {
              target: "debounce",
              description: "If the tab to be removed is active, navigate to the next tab",
              actions: ["removeTab", "navigateToLastTab"],
            },
          ],
        },
        states: {
          fetching: {
            on: {
              "EXPLORER_TABS.ADD_TAB": {
                description: "This allows the tab to be added from the route level before the tabs are fetched",
                actions: ["addTab"],
              },
            },
            invoke: {
              id: "fetchTabs",
              src: "fetchTabs",
              onDone: {
                target: "idle",
                actions: ["setTabs"],
              },
            },
          },
          debounce: {
            on: {
              "EXPLORER_TABS.ADD_TAB": {
                target: "debounce",
                actions: ["addTab"],
              },
              "EXPLORER_TABS.REORDER_TABS": {
                target: "debounce",
                actions: ["reorderTabs"],
              },
            },
            after: {
              1000: "saveTabs",
            },
          },
          saveTabs: {
            invoke: {
              id: "setTabs",
              src: "setTabs",
              onDone: {
                target: "idle",
              },
            },
          },
          idle: {
            on: {
              "EXPLORER_TABS.REORDER_TABS": {
                target: "debounce",
                actions: ["reorderTabs"],
              },
              "EXPLORER_TABS.ADD_TAB": {
                target: "debounce",
                actions: ["addTab"],
              },
              "EXPLORER_TABS.CLOSE_ALL": {
                description:
                  "Close all tabs except the active tab. For better aesthetics, we also disable the view of the action buttons while the animation of the tabs is happening.",
                actions: ["closeAllTabs"],
                target: "disableActions",
              },
            },
          },
          disableActions: {
            after: { 800: "debounce" },
          },
        },
      },
      {
        actions: {
          updateTabs: assign((context, event) => {
            const updatedId = event.payload.id;
            const updatedTab = context.tabs.find((tab) => tab.id === updatedId);
            if (!updatedTab) return context;
            return {
              tabs: context.tabs.map((tab) => {
                if (tab.id === updatedId) {
                  return { ...tab, name: event.payload.name };
                }
                return tab;
              }),
            };
          }),
          addInitialTab: assign((context, event) => {
            return {
              initialTab: event.tab,
            };
          }),
          setTabs: assign((context, event) => {
            const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems")!;
            workItemsRef.send({ type: "WORK_ITEMS.ADD_MANY", payload: event.data });
            return {
              tabs: uniqBy(
                [
                  ...event.data
                    .map((workItem) => ({ type: workItem.typename, id: workItem.id, name: workItem.name }))
                    .filter((item) => item.type === "dashboard" || item.type === "query"),
                  ...(context.initialTab ? [context.initialTab] : []),
                ],
                "id"
              ),
            };
          }),
          addTab: assign((context, event) => {
            const { id, name, type } = event.tab;
            if (type === "dashboard" || type === "query") {
              const tabExists = context.tabs.some((tab) => tab.id === id);
              if (tabExists) return context;
              return {
                tabs: [...context.tabs, { id, name, type }],
              };
            }
            return context;
          }),
          reorderTabs: assign((context, event) => {
            const ids = event.payload;
            const newTabs = ids
              .map((id) => context.tabs.find((tab) => tab.id === id))
              .filter(Boolean) as ExplorerTabData[];
            return {
              tabs: newTabs,
            };
          }),
          removeTab: assign((context, event) => {
            const id = event.payload;
            return {
              tabs: context.tabs.filter((tab) => tab.id !== id),
            };
          }),
          navigateToLastTab: (context) => {
            const lastTab = context.tabs[context.tabs.length - 1];
            const navigateRef = actorSystem.get("navigate")!;
            const to = lastTab
              ? getExplorerTabUrl(lastTab.id, lastTab.type, window.location.search)
              : "/edit?closing=true";
            navigateRef.send({
              type: "NAVIGATE.NAVIGATE_TO",
              payload: to,
            });
          },
          closeAllTabs: assign((context) => {
            const { fileId } = getFileTypeAndIdFromUrl();
            return {
              tabs: context.tabs.filter((tab) => tab.id === fileId),
            };
          }),
          //@ts-ignore
          globalRemoveTab: raise((context, event) => {
            const { id } = event.payload;
            return {
              type: "EXPLORER_TABS.REMOVE_TAB",
              payload: id,
            };
          }),
          removeManyTabs: assign((context, event) => {
            const workItems = event.payload;
            const newTabs = context.tabs.filter((tab) => !workItems.some((workItem) => workItem.id === tab.id));
            return {
              tabs: newTabs,
            };
          }),
        },
        services: {
          globalEvents: () => globalEvents$$,
          fetchTabs: () => getTabs(),
          setTabs: (context) => setTabs({ tabs: context.tabs }),
        },
        guards: {
          isNotActiveTab: (context, event) => {
            const id = event.payload;
            const { fileId } = getFileTypeAndIdFromUrl();
            return id !== fileId;
          },
          containsActiveTab: (context, event) => {
            const { fileId } = getFileTypeAndIdFromUrl();
            return event.payload.some((tab) => tab.id === fileId);
          },
        },
      }
    );
  return machine;
};

interface ExplorerTabsContext {
  tabs: ExplorerTabData[];
  initialTab?: ExplorerTabData;
}

type ExplorerTabsEvent =
  | { type: "EXPLORER_TABS.DATA_LOADED"; payload: WorkItem[] }
  | {
      type: "EXPLORER_TABS.REORDER_TABS";
      payload: string[];
    }
  | {
      type: "EXPLORER_TABS.REMOVE_TAB";
      payload: string;
    }
  | {
      type: "EXPLORER_TABS.ADD_TAB";
      tab: ExplorerTabData;
    }
  | {
      type: "EXPLORER_TABS.ADD_INITIAL_TAB";
      tab: ExplorerTabData;
    }
  | {
      type: "EXPLORER_TABS.CLOSE_ALL";
    }
  | {
      type: "EXPLORER_TABS.UPDATE_TABS";
      payload: ExplorerTabData;
    }
  | {
      type: "done.invoke.fetchTabs";
      data: WorkItem[];
    };

export type ExplorerTabsRef = ActorRefFrom<ReturnType<typeof createExplorerTabsMachine>>;
type ExplorerTabsState = StateFrom<ReturnType<typeof createExplorerTabsMachine>>;

export type ExplorerTabData = {
  type: WorkItemType;
  id: string;
  name: string;
};

export const useTabs = () => {
  const explorerTabsRef = actorSystem.get<ExplorerTabsRef>("explorerTabs")!;
  const tabs = useSelector(explorerTabsRef, explorerTabsSelector);
  const isDisabled = useSelector(explorerTabsRef, isDisabledSelector);

  return {
    tabs,
    addTab: (tab: ExplorerTabData) => {
      explorerTabsRef.send({ type: "EXPLORER_TABS.ADD_TAB", tab });
    },
    addInitialTab: (tab: ExplorerTabData) => {
      explorerTabsRef.send({ type: "EXPLORER_TABS.ADD_INITIAL_TAB", tab });
    },
    removeTab: (id: string) => explorerTabsRef.send({ type: "EXPLORER_TABS.REMOVE_TAB", payload: id }),
    closeAll: () => explorerTabsRef.send({ type: "EXPLORER_TABS.CLOSE_ALL" }),
    isDisabled,
    reorderTabs: (ids: string[]) => explorerTabsRef.send({ type: "EXPLORER_TABS.REORDER_TABS", payload: ids }),
  };
};

const explorerTabsSelector = (state: ExplorerTabsState) => state.context.tabs;
const isDisabledSelector = (state: ExplorerTabsState) => state.matches("disableActions");
