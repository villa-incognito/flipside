import { ActorRefFrom, assign, createMachine } from "xstate";
import { useSelector } from "@xstate/react";
import { WorkItem } from "@fscrypto/domain/src/work-item";
import { recentWorkItems } from "~/features/add-to-dashboard/async/recent-work-items";
import { actorSystem } from "~/state";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { WorkItemsActorRef } from "../work-items/work-items";

export const createRecentlyOpenedMachine = () => {
  return createMachine(
    {
      id: "recently-opened",
      tsTypes: {} as import("./recently-opened-machine.typegen").Typegen0,
      predictableActionArguments: true,
      schema: {
        context: {} as RecentlyOpenedContext,
        events: {} as RecentlyOpenedEvents | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        recentWorkItems: [],
      },
      on: {
        "WORK_ITEMS.REMOVE": {
          actions: ["removeItemFromList"],
        },
        "WORK_ITEMS.REMOVE_MANY": {
          description: "Remove many items from the list",
          actions: ["removeManyItemsFromList"],
        },
      },
      initial: "fetching",
      states: {
        idle: {
          on: {
            "RECENTLY_OPENED.ADD": {
              actions: ["addItem"],
            },
          },
        },
        fetching: {
          invoke: {
            id: "recentWorkItems",
            src: "recentWorkItems",
            onDone: {
              target: "idle",
              actions: ["updateRecentWorkItemsList"],
            },
          },
        },
      },
    },
    {
      actions: {
        addItem: assign((context, event) => {
          const workItem = event.payload;
          if (
            (workItem.typename !== "dashboard" && workItem.typename !== "query") ||
            context.recentWorkItems.some((item) => item.id === workItem.id)
          ) {
            return {};
          }
          return {
            recentWorkItems: [event.payload, ...context.recentWorkItems],
          };
        }),
        updateRecentWorkItemsList: assign((context, event) => {
          const workItemsRef = actorSystem.get<WorkItemsActorRef>("workItems")!;
          workItemsRef.send({ type: "WORK_ITEMS.ADD_MANY", payload: event.data });
          return {
            recentWorkItems: event.data,
          };
        }),
        removeItemFromList: assign((context, event) => {
          const workItem = event.payload;
          if (workItem.typename !== "dashboard" && workItem.typename !== "query") {
            return {};
          }
          return {
            recentWorkItems: context.recentWorkItems.filter((item) => item.id !== workItem.id),
          };
        }),
        removeManyItemsFromList: assign((context, event) => {
          const workItems = event.payload;
          return {
            recentWorkItems: context.recentWorkItems.filter(
              (recent) => !workItems.some((workItem) => workItem.id === recent.id)
            ),
          };
        }),
      },
      services: {
        recentWorkItems: () => {
          return recentWorkItems({
            type: "all",
            limit: 10,
          });
        },
        globalEvents: () => globalEvents$$,
      },
    }
  );
};

interface RecentlyOpenedContext {
  recentWorkItems: WorkItem[];
}

type RecentlyOpenedEvents =
  | {
      type: "RECENTLY_OPENED.REMOVE_ITEM";
      payload: {
        id: string;
      };
    }
  | {
      type: "RECENTLY_OPENED.ADD";
      payload: WorkItem;
    }
  | {
      type: "done.invoke.recentWorkItems";
      data: WorkItem[];
    };

export type RecentlyOpenedRef = ActorRefFrom<ReturnType<typeof createRecentlyOpenedMachine>>;

export const useRecentlyOpenedMachine = () => {
  const service = actorSystem.get<RecentlyOpenedRef>("recentlyOpened")!;
  const isLoading = useSelector(service, (state) => state.matches("fetching"));
  const recentWorkItems = useSelector(service, (state) => state.context.recentWorkItems);
  return {
    recentWorkItems,
    isLoading,
  };
};
