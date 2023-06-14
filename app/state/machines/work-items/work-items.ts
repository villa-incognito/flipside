import { useSelector } from "@xstate/react";
import { ActorRefFrom, assign, createMachine, spawn, raise, StateFrom } from "xstate";
import { fetchWorkItems } from "~/async/fetch-work-items";
import { WorkItemNew, WorkItem, WorkItemType, WorkItemFork } from "@fscrypto/domain/src/work-item";
import { CreateWorkItemResponse, createWorkItem } from "~/async/create-work-item";
import { actorSystem } from "~/state/system";
import { WorkItemActorRef, createWorkItemMachine } from "./work-item";
import { ForkedWorkItemResponse, forkWorkItem } from "~/async/fork-work-item";
import { run } from "js-coroutines";
import { uniqBy } from "lodash";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { FileExplorerActorRef } from "~/features/file-explorer/machines/file-explorer-machine";
import { ExplorerTabsRef } from "~/features/explorer-tabs/machines/explorer-tabs-machine";
import { RecentlyOpenedRef } from "../recently-opened/recently-opened-machine";

export const createWorkItemsMachine = () => {
  const workItemsMachine = createMachine(
    {
      predictableActionArguments: true,
      id: "workItems",
      tsTypes: {} as import("./work-items.typegen").Typegen0,
      schema: {
        context: {} as WorkItemsContext,
        events: {} as WorkItemsEvent | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        workItems: [],
      },

      on: {
        "WORK_ITEMS.ADD": [
          {
            actions: ["addWorkItem", "updateTree", "addTab", "addToRecentItems", "navigateToItem"],
            cond: "isDashboardOrQuery",
          },
          {
            actions: ["addWorkItem", "updateTree"],
          },
        ],
        "WORK_ITEMS.REMOVE": {
          actions: ["removeWorkItem", "updateTree"],
        },
        "WORK_ITEMS.REMOVE_MANY": {
          actions: ["removeManyItems", "unregisterManyItems", "updateTree"],
        },
        "WORK_ITEMS.UPDATE_TREE": {
          actions: ["updateTree"],
        },
        "WORK_ITEMS.FETCH_CHILDREN": {
          description: "Fetches the work items for a collection and add a temporary loading element to the tree",
          actions: ["addLoadingSkeletonToTree"],
          target: "loadingCollectionData",
        },
        "WORK_ITEMS.ADD_MANY": {
          actions: ["addManyWorkItems"],
        },
      },
      initial: "loadingRootData",
      states: {
        idle: {
          id: "idle",
          on: {
            "WORK_ITEMS.CREATE": "creating",
            "WORK_ITEMS.FORK": "forking",
          },
        },
        loadingRootData: {
          initial: "fetching",
          states: {
            fetching: {
              invoke: {
                id: "fetchWorkItems",
                src: "fetchWorkItems",
                onDone: {
                  target: "loading",
                },
              },
            },
            loading: {
              invoke: {
                id: "createFileExplorerItems",
                src: "createFileExplorerItems",
              },
              on: {
                "WORK_ITEMS.ADD_MANY": {
                  actions: ["addManyWorkItems"],
                },
                "WORK_ITEMS.FINISHED_LOADING": {
                  target: "#idle",
                  actions: ["updateTree", "updateTabs"],
                },
              },
            },
          },
        },
        loadingCollectionData: {
          initial: "fetching",
          states: {
            fetching: {
              invoke: {
                id: "fetchWorkItems",
                src: "fetchWorkItems",
                onDone: {
                  target: "loading",
                },
              },
            },
            loading: {
              invoke: {
                id: "createFileExplorerItems",
                src: "createFileExplorerItems",
              },
              on: {
                // "WORK_ITEMS.ADD_MANY": {
                //   actions: ["addManyWorkItems"],
                // },
                "WORK_ITEMS.FINISHED_LOADING": {
                  target: "#idle",
                  actions: ["updateTree", "updateTabs"],
                },
              },
            },
          },
        },
        forking: {
          invoke: {
            id: "forkWorkItem",
            src: "forkWorkItem",
            onDone: {
              actions: ["addCreatedWorkItem"],
              target: "idle",
            },
          },
        },
        creating: {
          invoke: {
            id: "createWorkItem",
            src: "createWorkItem",
            onDone: {
              actions: ["addCreatedWorkItem"],
              target: "idle",
            },
          },
        },
      },
    },
    {
      actions: {
        updateTree: (context) => {
          const tree = actorSystem.get<FileExplorerActorRef>("fileExplorer")!;
          tree.send({
            type: "FILE_EXPLORER.UPDATE",
            payload: context.workItems.map((workItem) => workItem.getSnapshot()?.context.workItem!),
          });
        },
        addLoadingSkeletonToTree: (context, event) => {
          const tree = actorSystem.get<FileExplorerActorRef>("fileExplorer")!;
          tree.send({
            type: "FILE_EXPLORER.CREATE_TEMP_LOADING_ELEMENT",
            payload: {
              collectionId: event.payload.id,
              items: context.workItems.map((workItem) => workItem.getSnapshot()?.context.workItem!),
            },
          });
        },
        updateTabs: (context) => {
          const explorerTabs = actorSystem.get<ExplorerTabsRef>("explorerTabs")!;
          explorerTabs.send({
            type: "EXPLORER_TABS.DATA_LOADED",
            payload: context.workItems.map((workItem) => workItem.getSnapshot()?.context.workItem!),
          });
        },
        addWorkItem: assign((context, event) => {
          const workItemRef = spawn(createWorkItemMachine(event.payload), { name: event.payload.id, sync: true });
          actorSystem.register(workItemRef, `workItem-${event.payload.typename}-${event.payload.id}`);
          return {
            workItems: [...context.workItems, workItemRef],
          };
        }),

        removeWorkItem: assign({
          workItems: (context, event) => {
            // This only removes the work item from the workItems array, but does not stop the work item machine.
            // actorSystem.unregister(`workItem-${event.payload.typename}-${event.payload.id}`);
            return context.workItems.filter((workItem) => workItem.id !== event.payload.id);
          },
        }),
        // This only removes the work item from the workItems array, but does not stop the work item machine.
        removeManyItems: assign({
          workItems: (context, event) => {
            const workItemsToRemove = event.payload;
            return context.workItems.filter(
              (workItem) => !workItemsToRemove.some((workItemToRemove) => workItemToRemove.id === workItem.id)
            );
          },
        }),
        unregisterManyItems: (context, event) => {
          const workItemsToRemove = event.payload;
          workItemsToRemove.forEach((workItem) => {
            actorSystem.unregister(`workItem-${workItem.typename}-${workItem.id}`);
          });
        },
        addManyWorkItems: assign((context, event) => {
          const workItemsObj = event.payload.reduce<Record<`workItem-${WorkItemType}-${string}`, WorkItemActorRef>>(
            (acc, workItem) => {
              const id = `workItem-${workItem.typename}-${workItem.id}` as `workItem-${WorkItemType}-${string}`;
              const workItemRef = actorSystem.get<WorkItemActorRef>(id);
              if (workItemRef) {
                workItemRef.send({ type: "WORK_ITEM.UPDATE", payload: workItem });
                return acc;
              }
              acc[id] = spawn(createWorkItemMachine(workItem), { name: workItem.id });
              return acc;
            },
            {} as Record<string, WorkItemActorRef>
          );
          actorSystem.bulkRegister(workItemsObj);
          return {
            workItems: uniqBy([...context.workItems, ...Object.values(workItemsObj)], "id"),
          };
        }),
        //@ts-ignore
        addCreatedWorkItem: raise((_, e: { data: CreateWorkItemResponse }) => {
          return { type: "WORK_ITEMS.ADD", payload: e.data.workItem };
        }),
        navigateToItem: (context, event) => {
          const navigateRef = actorSystem.get("navigate")!;
          const typename = event.payload.typename;
          if (typename === "query") {
            navigateRef.send({
              type: "NAVIGATE.NAVIGATE_TO",
              payload: `/edit/queries/${event.payload.id}`,
            });
          }
          if (typename === "dashboard") {
            navigateRef.send({
              type: "NAVIGATE.NAVIGATE_TO",
              payload: `/edit/dashboards/${event.payload.id}`,
            });
          }
        },
        addTab: (context, event) => {
          const tabsRef = actorSystem.get<ExplorerTabsRef>("explorerTabs")!;
          tabsRef.send({
            type: "EXPLORER_TABS.ADD_TAB",
            tab: {
              id: event.payload.id,
              name: event.payload.name,
              type: event.payload.typename,
            },
          });
        },
        addToRecentItems: (context, event) => {
          const recentItemsRef = actorSystem.get<RecentlyOpenedRef>("recentlyOpened")!;
          recentItemsRef.send({
            type: "RECENTLY_OPENED.ADD",
            payload: event.payload,
          });
        },
      },
      services: {
        globalEvents: () => globalEvents$$,
        createWorkItem: async (context, event) => createWorkItem(event.payload),
        fetchWorkItems: async (context, event) => {
          if (event.type === "WORK_ITEMS.FETCH_CHILDREN") {
            await delay(100);
            return fetchWorkItems(event.payload.id);
          }
          return fetchWorkItems();
        },
        forkWorkItem: async (context, event) => forkWorkItem(event.payload),
        createFileExplorerItems: (_context, event) => (sendEvent) => {
          const items = event.data;
          run(function* () {
            let results: WorkItem[] = [];
            for (let i = 0; i < items.length; i++) {
              results.push(items[i]!);
              if (i > 0 && i % 1000 === 0) {
                sendEvent({ type: "WORK_ITEMS.ADD_MANY", payload: results });
                results = [];
                yield;
              }
            }
            sendEvent({ type: "WORK_ITEMS.ADD_MANY", payload: results });
            sendEvent({ type: "WORK_ITEMS.FINISHED_LOADING" });
          });
        },
      },
      guards: {
        isDashboardOrQuery: (context, event) => {
          return event.payload.typename === "dashboard" || event.payload.typename === "query";
        },
      },
    }
  );
  return workItemsMachine;
};

export type WorkItemsActorRef = ActorRefFrom<ReturnType<typeof createWorkItemsMachine>>;

interface WorkItemsContext {
  workItems: WorkItemActorRef[];
}

type WorkItemsEvent =
  | { type: "WORK_ITEMS.ADD"; payload: WorkItem }
  | { type: "WORK_ITEMS.ADD_MANY"; payload: WorkItem[] }
  | { type: "WORK_ITEMS.CREATE"; payload: WorkItemNew }
  | { type: "WORK_ITEMS.FORK"; payload: WorkItemFork }
  | { type: "WORK_ITEMS.REMOVE"; payload: { id: string; typename: WorkItemType } }
  | { type: "WORK_ITEMS.UPDATE_TREE" }
  | { type: "WORK_ITEMS.FINISHED_LOADING" }
  | { type: "done.invoke.createWorkItem"; data: CreateWorkItemResponse }
  | { type: "done.invoke.forkWorkItem"; data: ForkedWorkItemResponse }
  | { type: "done.invoke.fetchWorkItems"; data: WorkItem[] }
  | { type: "WORK_ITEMS.FETCH_CHILDREN"; payload: { id: string } };

export type WorkItemsGlobalEvent =
  | {
      type: "WORK_ITEMS.REMOVE";
      payload: WorkItem;
    }
  | {
      type: "WORK_ITEMS.REMOVE_MANY";
      payload: WorkItem[];
    };

export const useWorkItems = () => {
  const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems")!;
  const collections = useSelector(workItemsRef, collectionsSelector);
  const isCreating = useSelector(workItemsRef, isCreatingSelector);
  const isLoading = useSelector(workItemsRef, isLoadingRootSelector);
  return {
    collections,
    isCreating: isCreating,
    isLoading: isLoading,
    create: (workItem: WorkItemNew) => workItemsRef.send({ type: "WORK_ITEMS.CREATE", payload: workItem }),
    add: (workItem: WorkItem) => workItemsRef.send({ type: "WORK_ITEMS.ADD", payload: workItem }),
    fork: (workItem: WorkItemFork) => workItemsRef.send({ type: "WORK_ITEMS.FORK", payload: workItem }),
    fetchCollection: (id: string) => {
      workItemsRef.send({ type: "WORK_ITEMS.FETCH_CHILDREN", payload: { id } });
    },
  };
};

type WorkItemsState = StateFrom<ReturnType<typeof createWorkItemsMachine>>;

const collectionsSelector = (state: WorkItemsState) =>
  state.context.workItems
    .filter((workItem) => workItem.getSnapshot()!.context.workItem.typename === "collection")
    .map((collectionRef) => collectionRef.getSnapshot()!.context.workItem);

const visualizationsSelector = (state: WorkItemsState) =>
  state.context.workItems
    .filter((workItem) => workItem.getSnapshot()!.context.workItem.typename === "visualization")
    .map((visualizationRef) => visualizationRef.getSnapshot()!.context.workItem);

const isCreatingSelector = (state: WorkItemsState) => state.matches("creating");
export const isLoadingRootSelector = (state: WorkItemsState) => state.matches("loadingRootData");

export const useCollections = () => {
  const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems")!;
  const collections = useSelector(workItemsRef, collectionsSelector);
  return collections;
};
export const useWorkItemVisualizations = () => {
  const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems")!;
  const visualizations = useSelector(workItemsRef, visualizationsSelector);
  return visualizations;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
