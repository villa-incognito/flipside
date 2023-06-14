import { ActorRefFrom, StateFrom, assign, createMachine } from "xstate";
import { useSelector } from "@xstate/react";
import { actorSystem } from "~/state";
import { SortBy, SortDir, makeExplorerTree } from "../util/makeExplorerTree";
import { TreeItem } from "performant-array-to-tree";
import { WorkItemsActorRef, isLoadingRootSelector } from "~/state/machines/work-items/work-items";
import { WorkItem, WorkItemNew, WorkItemType } from "@fscrypto/domain/src/work-item";
import { $path } from "remix-routes";
import { searchWorkItems } from "~/features/add-to-dashboard/async/search-work-items";
import { WorkItemActorRef } from "~/state/machines/work-items/work-item";

export const createFileExplorerMachine = () => {
  const workItemsMachine = createMachine(
    {
      predictableActionArguments: true,
      id: "fileExplorer",
      tsTypes: {} as import("./file-explorer-machine.typegen").Typegen0,
      schema: {
        context: {} as FileExplorerContext,
        events: {} as FileExplorerEvent,
      },
      type: "parallel",
      context: {
        explorerTree: [],
        sortDir: "DESC",
        sortBy: "updatedAt",
        searchTerm: "",
        selectedItems: [],
        filteredList: [],
      },
      on: {
        "FILE_EXPLORER.UPDATE": {
          actions: ["updateExplorerTree"],
        },
        "FILE_EXPLORER.SET_DIRECTION": {
          actions: ["setDirection", "sortExplorerTree"],
        },
        "FILE_EXPLORER.SET_SORT_BY": {
          actions: ["setSortBy", "sortExplorerTree"],
        },
        "FILE_EXPLORER.ADD_SELECTED_ITEM": {
          actions: ["addSelectedItem"],
        },
        "FILE_EXPLORER.REMOVE_SELECTED_ITEM": {
          actions: ["removeSelectedItem"],
        },
        "FILE_EXPLORER.REMOVE_FILTERED_ITEM": {
          description: "Remove an item from the filtered list",
          actions: ["removeFilteredItem"],
        },
        "FILE_EXPLORER.HANDLE_MULTI_SELECT": [
          {
            actions: ["clearSelectedItems"],
            cond: "isMultiSelectCancelled",
          },
        ],
        "FILE_EXPLORER.UNSELECT_ALL": {
          actions: ["clearSelectedItems"],
        },
        "FILE_EXPLORER.CREATE_TEMP_LOADING_ELEMENT": {
          actions: ["addLoadingSkeletonToTree"],
        },
      },
      states: {
        view: {
          initial: "tree",
          on: {
            "FILE_EXPLORER.SET_SEARCH_TERM": [
              {
                actions: ["setSearchTerm"],
                target: ".filteredList.debounce",
                cond: "isNameFilterLongEnough",
              },
              {
                actions: ["setSearchTerm"],
                target: ".tree",
              },
            ],
          },
          states: {
            filteredList: {
              states: {
                idle: {},
                debounce: {
                  after: {
                    500: {
                      target: "searchItems",
                    },
                  },
                },
                searchItems: {
                  invoke: {
                    id: "searchItems",
                    src: "searchItems",
                    onDone: {
                      actions: ["setSearchItems"],
                      target: "idle",
                    },
                  },
                },
              },
            },
            tree: {},
          },
        },
        selected: {
          initial: "idle",
          states: {
            idle: {
              on: {
                "FILE_EXPLORER.HANDLE_MULTI_SELECT": [
                  { target: "idle", cond: "isMultiSelectCancelled", actions: ["clearSelectedItems"] },
                  {
                    target: "saving",
                    actions: ["updateSelectedParentIds"],
                  },
                ],
              },
            },
            saving: {
              invoke: {
                id: "moveSelectedItems",
                src: "moveSelectedItems",
                onDone: {
                  actions: ["clearSelectedItems"],
                  target: "idle",
                },
              },
            },
          },
        },
      },
    },
    {
      actions: {
        setSearchItems: assign((context, event) => {
          const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems")!;
          workItemsRef.send({ type: "WORK_ITEMS.ADD_MANY", payload: event.data });
          return {
            filteredList: event.data,
          };
        }),
        removeFilteredItem: assign((context, event) => {
          return {
            filteredList: context.filteredList.filter((item) => item.id !== event.payload.id),
          };
        }),
        setDirection: assign((context, event) => {
          return {
            sortDir: event.payload,
          };
        }),
        setSortBy: assign((context, event) => {
          return {
            sortBy: event.payload,
          };
        }),
        setSearchTerm: assign((context, event) => {
          return {
            searchTerm: event.payload,
          };
        }),
        sortExplorerTree: assign((context) => {
          const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems")!.getSnapshot();
          const workItems =
            workItemsRef?.context?.workItems.map((workItemRef) => workItemRef.getSnapshot()!.context.workItem) ?? [];
          const explorerTree = makeExplorerTree({
            sortBy: context.sortBy,
            sortDir: context.sortDir,
            workItems,
          });
          return {
            explorerTree,
          };
        }),
        updateExplorerTree: assign((context, event) => {
          const explorerTree = makeExplorerTree({
            sortBy: context.sortBy,
            sortDir: context.sortDir,
            workItems: event.payload,
          });
          return {
            explorerTree,
          };
        }),
        addLoadingSkeletonToTree: assign((context, event) => {
          const tempLoadingItem = {
            id: "tempLoadingItem",
            name: "tempLoadingItem",
            typename: "query",
            parentId: event.payload.collectionId,
          };
          const explorerTree = makeExplorerTree({
            sortBy: context.sortBy,
            sortDir: context.sortDir,
            workItems: [...event.payload.items, tempLoadingItem as WorkItem],
          });
          return {
            explorerTree,
          };
        }),
        addSelectedItem: assign((context, event) => {
          return {
            selectedItems: [...context.selectedItems, event.payload],
          };
        }),
        removeSelectedItem: assign((context, event) => {
          return { selectedItems: context.selectedItems.filter((item) => item.id !== event.payload.id) };
        }),
        updateSelectedParentIds: (context, event) => {
          const { selectedItems } = context;
          selectedItems.forEach((item) =>
            actorSystem
              .get(`workItem-${item.typename}-${item.id}`)
              ?.send({ type: "WORK_ITEM.SET_UPDATED_PARENT_ID", payload: { parentId: event.payload.collectionId } })
          );
        },
        clearSelectedItems: assign((context) => {
          const { selectedItems } = context;
          selectedItems.forEach((item) =>
            actorSystem
              .get<WorkItemActorRef>(`workItem-${item.typename}-${item.id}`)
              ?.send({ type: "WORK_ITEM.REMOVE_SELECTED" })
          );
          return { selectedItems: [] as SelectedItems };
        }),
      },
      services: {
        moveSelectedItems: (context, event) => {
          const url =
            window.location.protocol +
            "//" +
            window.location.host +
            $path("/api/collections/:id/multi-move", { id: event.payload.collectionId ?? "null" });
          return fetch(url, {
            method: "post",
            body: JSON.stringify({
              items: context.selectedItems.map((item) => ({ id: item.id, type: item.typename })),
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => response.json());
        },
        searchItems: (context) => {
          return searchWorkItems({
            term: context.searchTerm,
            type: "all",
          });
        },
      },
      guards: {
        isNameFilterLongEnough: (_, event) => event.payload.length >= 3,
        isMultiSelectCancelled: (_, event) => !!event.payload.cancel,
      },
    }
  );
  return workItemsMachine;
};

export type FileExplorerActorRef = ActorRefFrom<ReturnType<typeof createFileExplorerMachine>>;

interface FileExplorerContext {
  explorerTree: TreeItem[];
  sortDir: SortDir;
  sortBy: SortBy;
  searchTerm: string;
  selectedItems: SelectedItems;
  filteredList: WorkItem[];
}

export type SelectedItems = { id: string; typename: WorkItemType }[];

type FileExplorerEvent =
  | { type: "FILE_EXPLORER.UPDATE"; payload: WorkItem[] }
  | { type: "FILE_EXPLORER.SET_DIRECTION"; payload: SortDir }
  | { type: "FILE_EXPLORER.SET_SORT_BY"; payload: SortBy }
  | { type: "FILE_EXPLORER.SET_SEARCH_TERM"; payload: string }
  | { type: "FILE_EXPLORER.ADD_SELECTED_ITEM"; payload: { id: string; typename: WorkItemType } }
  | { type: "FILE_EXPLORER.REMOVE_SELECTED_ITEM"; payload: { id: string } }
  | { type: "FILE_EXPLORER.REMOVE_FILTERED_ITEM"; payload: { id: string } }
  | { type: "FILE_EXPLORER.HANDLE_MULTI_SELECT"; payload: { cancel?: boolean; collectionId?: string | null } }
  | { type: "FILE_EXPLORER.UNSELECT_ALL" }
  | { type: "FILE_EXPLORER.CREATE_TEMP_LOADING_ELEMENT"; payload: { collectionId: string; items: WorkItem[] } }
  | {
      type: "done.invoke.searchItems";
      data: WorkItem[];
    };

export const useFileExplorerMachine = () => {
  const fileExplorerMachineRef = actorSystem.get<FileExplorerActorRef>("fileExplorer")!;
  const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems")!;
  const isLoading = useSelector(workItemsRef, isLoadingRootSelector);

  const explorerTree = useSelector(fileExplorerMachineRef, explorerTreeSelector);
  const sortDir = useSelector(fileExplorerMachineRef, sortDirSelector);
  const sortBy = useSelector(fileExplorerMachineRef, sortBySelector);
  const searchTerm = useSelector(fileExplorerMachineRef, searchTermSelector);
  const selectedItems = useSelector(fileExplorerMachineRef, selectedItemsSelector);
  const isFilteredView = useSelector(fileExplorerMachineRef, isFilteredViewSelector);
  const filteredItems = useSelector(fileExplorerMachineRef, filteredItemsSelector);
  const isLoadingFilteredItems = useSelector(fileExplorerMachineRef, isLoadingFilteredItemsSelector);
  return {
    explorerTree,
    setSortDir: (sortDir: SortDir) =>
      fileExplorerMachineRef.send({ type: "FILE_EXPLORER.SET_DIRECTION", payload: sortDir }),
    setSortBy: (sortBy: SortBy) => fileExplorerMachineRef.send({ type: "FILE_EXPLORER.SET_SORT_BY", payload: sortBy }),
    setSearchTerm: (searchTerm: string) =>
      fileExplorerMachineRef.send({ type: "FILE_EXPLORER.SET_SEARCH_TERM", payload: searchTerm }),
    searchTerm,
    sortDir,
    sortBy,
    isFilteredView,
    create: (workItem: WorkItemNew) => workItemsRef.send({ type: "WORK_ITEMS.CREATE", payload: workItem }),
    isInitialDataLoading: isLoading,
    selectedItems,
    filteredItems: filteredItems,
    // deleteItem: (id: string) => {
    //   fileExplorerMachineRef.send({ type: "FILE_EXPLORER.REMOVE_FILTERED_ITEM", payload: { id } });
    //   // workItemsRef.send({ type: "WORK_ITEMS.DELETE", payload: id });
    // },
    isLoadingFilteredItems,
  };
};

type FileExplorerState = StateFrom<ReturnType<typeof createFileExplorerMachine>>;

const explorerTreeSelector = (state: FileExplorerState) => state.context.explorerTree;
const sortDirSelector = (state: FileExplorerState) => state.context.sortDir;
const sortBySelector = (state: FileExplorerState) => state.context.sortBy;
const searchTermSelector = (state: FileExplorerState) => state.context.searchTerm;
const selectedItemsSelector = (state: FileExplorerState) => state.context.selectedItems;
const isFilteredViewSelector = (state: FileExplorerState) => state.matches("view.filteredList");
const filteredItemsSelector = (state: FileExplorerState) => state.context.filteredList;
const isLoadingFilteredItemsSelector = (state: FileExplorerState) =>
  state.matches("view.filteredList.searchItems") || state.matches("view.filteredList.debounce");

export const useSelectedItems = () => {
  const fileExplorerMachineRef = actorSystem.get<FileExplorerActorRef>("fileExplorer")!;
  const selectedItems = useSelector(fileExplorerMachineRef, selectedItemsSelector);
  return selectedItems;
};
