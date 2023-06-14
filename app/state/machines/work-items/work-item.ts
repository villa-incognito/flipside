import { useSelector } from "@xstate/react";
import { ActorRefFrom, StateFrom, assign, createMachine, toActorRef } from "xstate";
import { WorkItem, WorkItemFork, WorkItemType } from "@fscrypto/domain/src/work-item";
import { moveWorkItem } from "~/async/move-work-item";
import { updateWorkItem } from "~/async/update-work-item";
import { deleteWorkItem } from "~/async/delete-work-item";
import { actorSystem } from "~/state/system";
import { tracking } from "~/utils/tracking";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { FileExplorerActorRef } from "~/features/file-explorer/machines/file-explorer-machine";
import { WorkItemsActorRef } from "./work-items";
import { ExplorerTabsRef } from "~/features/explorer-tabs/machines/explorer-tabs-machine";
import { RecentlyOpenedRef } from "../recently-opened/recently-opened-machine";

export const createWorkItemMachine = (workItem: WorkItem) => {
  const workItemsMachine = createMachine(
    {
      predictableActionArguments: true,
      id: "workItem",
      tsTypes: {} as import("./work-item.typegen").Typegen0,
      schema: {
        context: {} as WorkItemContext,
        events: {} as WorkItemEvent | GlobalEvent,
      },
      context: {
        workItem,
        childrenFetched: false,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      initial: "idle",
      on: {
        "DASHBOARD.SET_TITLE": {
          actions: ["updateName", "updateParentTree", "updateTabs"],
          cond: "isDashboardId",
        },
        "QUERY.SET_NAME": {
          actions: ["updateName", "updateParentTree", "updateTabs"],
          cond: "isQueryId",
        },
        "DASHBOARD.DELETE_REQUEST": {
          target: "deleting",
          cond: "isDashboardId",
        },
        "QUERY.DELETE_REQUEST": {
          target: "deleting",
          cond: "isQueryId",
        },
        "MOVE_WORK_ITEMS.SET_MOVE": {
          actions: ["moveWorkItem"],
          target: "moving",
          cond: "isWorkItem",
        },
        "WORK_ITEM.FETCH_CHILDREN": {
          actions: ["fetchChildren"],
          cond: "noChildrenFetched",
        },
      },
      states: {
        idle: {
          id: "idle",
          on: {
            "WORK_ITEM.SET_UPDATING": {
              target: "updating",
            },
            "WORK_ITEM.CLICK": [
              {
                target: "selected",
                cond: "isCommandClicked",
              },
              {
                actions: ["addToRecent", "unselectAll"],
              },
            ],
            "WORK_ITEM.MOVE": {
              actions: ["moveWorkItem"],
              target: "moving",
            },
            "WORK_ITEM.DELETE": {
              target: "deleting",
            },
          },
        },
        moving: {
          entry: ["moveRequest"],
          invoke: {
            id: "moveWorkItem",
            src: "moveWorkItem",
            onDone: {
              actions: ["moveSuccess"],
              target: "idle",
            },
          },
        },
        updating: {
          on: {},
          initial: "input",
          states: {
            input: {
              on: {
                "WORK_ITEM.SET_NAME": {
                  target: "saving",
                  actions: ["updateName", "updateParentTree", "updateTabs"],
                },
                "WORK_ITEM.CANCEL_UPDATING": "#idle",
              },
            },
            saving: {
              entry: ["updateRequest"],
              invoke: {
                id: "updateName",
                src: "updateName",
                onDone: {
                  target: "#idle",
                  actions: ["updateSuccess"],
                },
                onError: "error",
              },
            },
            error: {},
          },
        },
        deleting: {
          description: "this process deletes the workItem and all of its children, if it has any.",
          entry: "broadcastDeleteWorkItem",
          invoke: {
            id: "deleteWorkItemAndChildren",
            src: "deleteWorkItemAndChildren",
            onDone: {
              description:
                "if the type of deletion was a collection, it returns an array of items that also need to be removed and unregistered from app state if they are in memory.",
              actions: ["broadcastRemoveChildItems", "unregisterWorkItems"],
              target: "deleted",
            },
          },
        },
        deleted: {
          entry: ["trackingDelete"],
          type: "final",
        },
        selected: {
          description:
            "The selected state is manged by the fileExplorer machine. This state is used to show the selected state of the workItem",
          entry: ["addSelectedItem"],
          on: {
            "WORK_ITEM.SET_UPDATED_PARENT_ID": {
              description: "this sets the parentId if it has been updated from multi-select/file explorer",
              actions: ["setUpdatedParentId"],
            },
            "WORK_ITEM.CLICK": [
              {
                target: "idle",
                cond: "isCommandClicked",
                actions: ["removeSelectedItem"],
              },
            ],
            "WORK_ITEM.REMOVE_SELECTED": {
              target: "idle",
              actions: ["removeSelectedItem"],
            },
          },
        },
      },
    },
    {
      actions: {
        updateRequest: (context) => {
          globalEvents$$.next({
            type: "WORK_ITEM.UPDATE_REQUEST",
            payload: context.workItem,
            id: context.workItem.id,
          });
        },
        updateSuccess: (context, event) => {
          globalEvents$$.next({
            type: "WORK_ITEM.UPDATE_SUCCESS",
            payload: event.data.workItem,
            id: context.workItem.id,
          });
        },
        moveRequest: (context) => {
          globalEvents$$.next({
            type: "WORK_ITEM.MOVE_REQUEST",
            payload: context.workItem,
            id: context.workItem.id,
          });
        },
        moveSuccess: (context, event) => {
          globalEvents$$.next({
            type: "WORK_ITEM.MOVE_SUCCESS",
            payload: event.data.workItem,
            id: context.workItem.id,
          });
        },
        broadcastDeleteWorkItem: (context) => {
          globalEvents$$.next({ type: "WORK_ITEMS.REMOVE", payload: context.workItem });
        },
        broadcastRemoveChildItems: (context, event) => {
          const workItems = event.data;
          globalEvents$$.next({ type: "WORK_ITEMS.REMOVE_MANY", payload: workItems });
        },
        unregisterWorkItems: (context, event) => {
          const workItems = event.data;
          workItems.forEach((item) => {
            actorSystem.unregister(`workItem-${item.typename}-${item.id}`);
          });
          actorSystem.unregister(`workItem-${context.workItem.typename}-${context.workItem.id}`);
        },
        addSelectedItem: (context) => {
          const fileExplorerRef = actorSystem.get<FileExplorerActorRef>("fileExplorer")!;
          fileExplorerRef.send({
            type: "FILE_EXPLORER.ADD_SELECTED_ITEM",
            payload: {
              id: context.workItem.id,
              typename: context.workItem.typename,
            },
          });
        },

        removeSelectedItem: (context) => {
          const fileExplorerRef = actorSystem.get<FileExplorerActorRef>("fileExplorer")!;
          fileExplorerRef.send({
            type: "FILE_EXPLORER.REMOVE_SELECTED_ITEM",
            payload: {
              id: context.workItem.id,
            },
          });
        },
        updateName: assign((context, event) => {
          return {
            workItem: {
              ...context.workItem,
              name: event.payload,
            },
          };
        }),
        unselectAll: () => {
          const fileExplorerRef = actorSystem.get<FileExplorerActorRef>("fileExplorer")!;
          fileExplorerRef.send({
            type: "FILE_EXPLORER.UNSELECT_ALL",
          });
        },
        updateParentTree: (_) => {
          return {
            type: "WORK_ITEMS.UPDATE_TREE",
          };
        },
        moveWorkItem: assign((context, event) => {
          setTimeout(() => {
            const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems");
            workItemsRef?.send({ type: "WORK_ITEMS.UPDATE_TREE" });
          }, 0);
          return {
            workItem: {
              ...context.workItem,
              parentId: event.payload.parentId ?? null,
            },
          };
        }),
        setUpdatedParentId: assign((context, event) => {
          setTimeout(() => {
            const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems");
            workItemsRef?.send({ type: "WORK_ITEMS.UPDATE_TREE" });
          }, 0);
          return {
            workItem: {
              ...context.workItem,
              parentId: event.payload.parentId ?? null,
            },
          };
        }),
        updateTabs: (context) => {
          const tabsRef = actorSystem.get<ExplorerTabsRef>("explorerTabs")!;
          tabsRef.send({
            type: "EXPLORER_TABS.UPDATE_TABS",
            payload: {
              id: context.workItem.id,
              name: context.workItem.name,
              type: context.workItem.typename,
            },
          });
        },
        trackingDelete: (context) => {
          tracking("delete_workItems", "My Work", {
            id: context.workItem.id,
            name: context.workItem.name,
            type: context.workItem.typename,
          });
        },
        fetchChildren: assign((_) => {
          const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems")!;
          workItemsRef.send({ type: "WORK_ITEMS.FETCH_CHILDREN", payload: { id: workItem.id } });
          return {
            childrenFetched: true,
          };
        }),
        addToRecent: (context) => {
          const recentItemsRef = actorSystem.get<RecentlyOpenedRef>("recentlyOpened")!;
          recentItemsRef.send({
            type: "RECENTLY_OPENED.ADD",
            payload: context.workItem,
          });
        },
      },
      services: {
        globalEvents: () => globalEvents$$,
        moveWorkItem: async (context, event) =>
          moveWorkItem({
            parentId: event.payload.parentId ?? null,
            id: context.workItem.id,
            typename: context.workItem.typename,
          }),
        updateName: async (context, event) =>
          updateWorkItem({ id: context.workItem.id, name: event.payload, typename: context.workItem.typename }),
        deleteWorkItemAndChildren: async (context) => {
          const { items } = await deleteWorkItem({ id: context.workItem.id, typename: context.workItem.typename });
          const removedChildItems = items.filter((item) => item.id !== context.workItem.id);
          return removedChildItems;
        },
      },
      guards: {
        isCommandClicked: (context, { event }) => {
          if (event.metaKey || event.ctrlKey) {
            event.stopPropagation();
            event.preventDefault();
            return true;
          }
          return false;
        },
        noChildrenFetched: (context) => {
          return context.childrenFetched === false;
        },
        isWorkItem: (context, event) => {
          return event.workItemId === context.workItem.id;
        },
        isDashboardId: (context, event) => {
          return event.dashboardId === context.workItem.id;
        },
        isQueryId: (context, event) => {
          return event.queryId === context.workItem.id;
        },
      },
    }
  );
  return workItemsMachine;
};

export type WorkItemActorRef = ActorRefFrom<ReturnType<typeof createWorkItemMachine>>;
interface WorkItemContext {
  workItem: WorkItem;
  childrenFetched: boolean;
}

type WorkItemEvent =
  | { type: "WORK_ITEM.UPDATE"; payload: WorkItem }
  | { type: "WORK_ITEM.DELETE" }
  | { type: "WORK_ITEM.MOVE"; payload: { parentId?: string | null; workItemId?: string } }
  | { type: "WORK_ITEM.SET_UPDATING" }
  | { type: "WORK_ITEM.SET_UPDATED_PARENT_ID"; payload: { parentId?: string | null } }
  | { type: "WORK_ITEM.CANCEL_UPDATING" }
  | { type: "WORK_ITEM.REMOVE_SELECTED" }
  | { type: "WORK_ITEM.CLICK"; event: React.MouseEvent }
  | { type: "WORK_ITEM.FETCH_CHILDREN" }
  | {
      type: "done.invoke.deleteWorkItemAndChildren";
      data: WorkItem[];
    }
  | {
      type: "done.invoke.updateName";
      data: { workItem: WorkItem };
    }
  | {
      type: "done.invoke.moveWorkItem";
      data: { workItem: WorkItem };
    };

export type WorkItemGlobalEvent =
  | {
      type: "WORK_ITEM.UPDATE_REQUEST";
      payload: WorkItem;
      id: string;
    }
  | {
      type: "WORK_ITEM.UPDATE_SUCCESS";
      payload: WorkItem;
      id: string;
    }
  | {
      type: "WORK_ITEM.MOVE_REQUEST";
      payload: WorkItem;
      id: string;
    }
  | {
      type: "WORK_ITEM.MOVE_SUCCESS";
      payload: WorkItem;
      id: string;
    }
  | {
      type: "WORK_ITEM.EXTERNAL_SET_NAME";
      payload: string;
      workItemId: string;
    }
  | { type: "WORK_ITEM.SET_NAME"; payload: string; workItemId: string; entityType?: WorkItemType }
  | { type: "WORK_ITEM.UPDATE_REQUEST"; payload: WorkItem; id: string };

export const useWorkItem = ({ id, typename }: { id: string; typename: WorkItemType }) => {
  const workItemRef =
    actorSystem.get<WorkItemActorRef>(`workItem-${typename}-${id}`)! ??
    (toActorRef({ send: () => {} }) as WorkItemActorRef);
  const fileExplorerRef = actorSystem.get<FileExplorerActorRef>("fileExplorer")!;
  const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems")!;

  const workItem = useSelector(workItemRef, workItemSelector);
  const isUpdating = useSelector(workItemRef, isUpdatingSelector);
  const isSelected = useSelector(workItemRef, isSelectedSelector);
  return {
    workItem,
    move: (parentId?: string) => workItemRef.send({ type: "WORK_ITEM.MOVE", payload: { parentId } }),
    isUpdating,
    isSelected,
    handleMultiSelect: ({ collectionId, cancel }: { cancel?: boolean; collectionId?: string | null }) =>
      fileExplorerRef.send({ type: "FILE_EXPLORER.HANDLE_MULTI_SELECT", payload: { collectionId, cancel } }),
    setUpdating: () => workItemRef.send({ type: "WORK_ITEM.SET_UPDATING" }),
    cancelUpdating: () => workItemRef.send({ type: "WORK_ITEM.CANCEL_UPDATING" }),
    updateName: (name: string) => globalEvents$$.next({ type: "WORK_ITEM.SET_NAME", payload: name, workItemId: id }),
    deleteItem: () => {
      fileExplorerRef.send({ type: "FILE_EXPLORER.REMOVE_FILTERED_ITEM", payload: { id } });
      workItemRef.send({ type: "WORK_ITEM.DELETE" });
    },
    onClick: (event: React.MouseEvent) => workItemRef.send({ type: "WORK_ITEM.CLICK", event }),
    forkItem: (payload: WorkItemFork) => {
      workItemsRef.send({ type: "WORK_ITEMS.FORK", payload });
    },
    fetchChildren: () => workItemRef.send({ type: "WORK_ITEM.FETCH_CHILDREN" }),
  };
};

type WorkItemState = StateFrom<ReturnType<typeof createWorkItemMachine>>;

const workItemSelector = (state: WorkItemState) => state.context.workItem;
const isUpdatingSelector = (state: WorkItemState) => state.matches("updating");
const isSelectedSelector = (state: WorkItemState) => state.matches("selected");
