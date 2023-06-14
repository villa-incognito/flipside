import { WorkItem } from "@fscrypto/domain/src/work-item";
import { useInterpret, useSelector } from "@xstate/react";
import { ActorRefFrom, StateFrom, assign, createMachine } from "xstate";
import { fetchWorkItem } from "~/async/fetch-work-item";
import { fetchWorkItems } from "~/async/fetch-work-items";
import { GlobalEvent, globalEvents$$ } from "~/state/events";

export const createMoveWorkItemMachine = () => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QFsD2A3MB1VAnA1gJIAuYyAdKgA5gB2AxALIDyAagKID6WzASgNKdCAFXaMAyuQDCAGWbj2AbQAMAXUSgqqWAEtiO1LQ0gAHogBMAZkvkA7MssBGRwA4AbI8sAWSwE5flgA0IACeiI7mLuRe-r4xti7Kyr7KtgC+acFomDgEJGSUNAwsHNx8giJikgrCnFLMMjLsUsKEzAByQgAiKupIIFq6+obGZggArAnkqQ7OLuNuyV62wWEIXsrm0bZubrbj45Yutj4ZWRjYeESkFNR0TGxcPAJCohLkNZwKTS3sXXUNH6tDq9YyDPQGIz9MYpRzkSzKLxuFy+RxxVKWFahCyWNzkcZJByWcbmXxucwUxxnEDZS55G6Fe4lJ7lV5VcjMtmMUH9cHDKGgMaTKIzJyuBZLLFrDw2Za7NzE2yeLyk6m03LXAp3WjkABmYGIAGMABaEWgQgCGABsuhbiBb6BBDGByDpaOhUPgXfqjabzfprbb7TzNNoISNoeFrFFLOZZqlHEkAqtEATfNtdmSIvNjrs1RcNflbkU9QaTVJUFarWBDfygw6nbQXW6PV7S76K1Wa3W7RaQwMw-zRlGjvC404E0mgtj1g5yL4dntxj5MW5xi58zkrkXGTrsm6oPR+3zIcOEOYfHZZq4ZT5-NO1o4prF-I5l75jr5zOlMjSC9uGUNK1tEgB5SmeCo3mqdhamYAAFdh2mPQdT0jc9L3sMV3GVPxkxnNwNnnRcFUmZVVWpWhUAgOBjHVACyDBFCI0FRAAFo3BTBB2M3OlNWLOhGKGVCWImBFpkwuYJTiKVECcLx50OVwUgvcxDnmHjCwZbVXQgatBPDAVTHCBZ00WAJMyVZQXHMDiZxXchx1UpUvBcZZbEsDT6P4nUfRNM1LRtXt9KHNDEys+FEWRML1xJWy1gJWwFNjFIxVfH9zi3ektRLXzjU7ata0hetguEoyEF8AkHIJJJSWOY5Ik4jYti8Q5zEcclFgiNxPKy7zyH3WgoBK5iyoXKIfH2ZQFQ-KwF04mVolayYCIXNwFx6vjyCAkCIGGwyxhVean3E6y1xcN9YxJDIMiAA */
      id: "moveWorkItem",
      tsTypes: {} as import("./move-work-item-machine.typegen").Typegen0,
      predictableActionArguments: true,
      schema: {
        context: {} as MoveWorkItemMachineContext,
        events: {} as MoveWorkItemEvents | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        workItemId: null,
        workItemData: null,
        initialCollection: null,
        selectedCollection: null,
        currentCollectionId: null,
        currentCollection: null,
        workItems: [],
        initialCollectionId: null,
      },
      initial: "closed",
      states: {
        open: {
          initial: "fetchInitialData",
          on: {
            "MOVE_WORK_ITEMS.CLOSE": {
              target: "closed",
            },
            "MOVE_WORK_ITEMS.SET_COLLECTION_ID": {
              target: ".fetchCollectionData",
              actions: "setCurrentCollectionId",
            },
            "MOVE_WORK_ITEMS.SET_SELECTED_COLLECTION": {
              actions: "setSelectedCollection",
            },
            "MOVE_WORK_ITEMS.MOVE_ITEM": {
              target: "closed",
              actions: ["broadcastMoveItem"],
            },
          },
          states: {
            idle: {},
            fetchInitialData: {
              invoke: {
                id: "fetchInitialData",
                src: "fetchInitialData",
                onDone: {
                  target: "idle",
                  actions: "setInitialData",
                },
              },
            },
            fetchCollectionData: {
              invoke: {
                id: "fetchCollectionData",
                src: "fetchCollectionData",
                onDone: {
                  target: "idle",
                  actions: "setCollectionData",
                },
              },
            },
          },
        },
        closed: {
          id: "closed",
          entry: "resetData",
          on: {
            "MOVE_WORK_ITEMS.SET_OPEN": {
              target: "open",
              actions: "setInitialIds",
            },
          },
        },
      },
    },
    {
      actions: {
        setCurrentCollectionId: assign((context, event) => {
          return {
            currentCollectionId: event.payload,
          };
        }),
        setInitialIds: assign((context, event) => {
          return {
            initialCollectionId: event.payload.collectionId ?? null,
            workItemId: event.payload.workItemId,
          };
        }),
        setInitialData: assign((context, event) => {
          const { workItemData, workItems, collection } = event.data;
          return {
            workItemData,
            workItems,
            currentCollection: collection,
            initialCollection: collection,
          };
        }),
        setCollectionData: assign((context, event) => {
          return {
            currentCollection: event.data.collection,
            workItems: event.data.workItems,
            selectedCollection: null,
          };
        }),
        setSelectedCollection: assign((context, event) => {
          return {
            selectedCollection:
              event.payload === context.selectedCollection?.id
                ? null
                : context.workItems.find((item) => item.id === event.payload),
          };
        }),
        broadcastMoveItem: (context) => {
          globalEvents$$.next({
            type: "MOVE_WORK_ITEMS.SET_MOVE",
            payload: {
              parentId: context.selectedCollection?.id ?? context.currentCollectionId,
            },
            workItemId: context.workItemId!,
          });
        },
        resetData: assign((_) => {
          return {
            workItemData: null,
            initialCollection: null,
            selectedCollection: null,
            currentCollectionId: null,
            currentCollection: null,
            workItems: [],
          };
        }),
      },
      services: {
        globalEvents: () => globalEvents$$,
        fetchInitialData: (context) => {
          const workItem = fetchWorkItem(context.workItemId);
          const collection = context.initialCollectionId
            ? fetchWorkItem(context.initialCollectionId)
            : Promise.resolve(null);
          const workItems = fetchWorkItems(context.initialCollectionId ?? null);
          return Promise.all([workItem, workItems, collection]).then(([workItemData, workItems, collection]) => {
            return {
              workItemData,
              workItems: partitionedAndSortedWorkItems(workItems),
              collection,
            };
          });
        },
        fetchCollectionData: (context) => {
          const collectionId = context.currentCollectionId;
          const collection = collectionId ? fetchWorkItem(collectionId) : Promise.resolve(null);
          const workItems = fetchWorkItems(collectionId ?? null);
          return Promise.all([workItems, collection]).then(([workItems, collection]) => {
            return {
              workItems: partitionedAndSortedWorkItems(workItems),
              collection,
            };
          });
        },
      },
    }
  );
};

interface MoveWorkItemMachineContext {
  workItemId: string | null;
  workItemData: WorkItem | null;
  initialCollectionId: string | null;
  initialCollection: WorkItem | null;
  workItems: WorkItem[];
  currentCollection: WorkItem | null;
  currentCollectionId: string | null;
  selectedCollection: WorkItem | null;
}

type MoveWorkItemEvents =
  | { type: "MOVE_WORK_ITEMS.CLOSE" }
  | { type: "MOVE_WORK_ITEMS.SET_COLLECTION_ID"; payload: string | null }
  | { type: "MOVE_WORK_ITEMS.SET_SELECTED_COLLECTION"; payload: string | null }
  | { type: "MOVE_WORK_ITEMS.MOVE_ITEM" }
  | {
      type: "done.invoke.fetchInitialData";
      data: {
        workItemData: WorkItem;
        workItems: WorkItem[];
        collection: WorkItem | null;
      };
    }
  | {
      type: "done.invoke.fetchCollectionData";
      data: {
        workItems: WorkItem[];
        collection: WorkItem | null;
      };
    };

export type MoveWorkItemGlobalEvent =
  | {
      type: "MOVE_WORK_ITEMS.SET_OPEN";
      payload: { workItemId: string; collectionId: string | null };
    }
  | {
      type: "MOVE_WORK_ITEMS.SET_MOVE";
      payload: { parentId: string | null };
      workItemId: string;
    };

export type MoveWorkItemRef = ActorRefFrom<ReturnType<typeof createMoveWorkItemMachine>>;
type State = StateFrom<ReturnType<typeof createMoveWorkItemMachine>>;

export const useMoveWorkItemMachine = () => {
  const moveWorkItemRef = useInterpret(() => createMoveWorkItemMachine());
  const workItemData = useSelector(moveWorkItemRef, workItemDataSelector);
  const workItems = useSelector(moveWorkItemRef, workItemsSelector);
  const currentCollection = useSelector(moveWorkItemRef, currentCollectionSelector);
  const initialCollection = useSelector(moveWorkItemRef, initialCollectionSelector);
  const selectedCollection = useSelector(moveWorkItemRef, selectedCollectionSelector);
  const initialCollectionId = useSelector(moveWorkItemRef, initialCollectionIdSelector);
  const isInitialLoading = useSelector(moveWorkItemRef, isInitialLoadingSelector);
  const isCollectionLoading = useSelector(moveWorkItemRef, isCollectionLoadingSelector);
  const isMoveDisabled =
    (initialCollectionId && selectedCollection?.id === initialCollectionId) ||
    (!selectedCollection?.id && (currentCollection?.id ?? null) === initialCollectionId);

  return {
    isInitialLoading,
    isCollectionLoading,
    isOpen: useSelector(moveWorkItemRef, isOpenSelector),
    openMoveItemModal: ({ workItemId, collectionId }: { workItemId: string; collectionId: string | null }) =>
      moveWorkItemRef.send({ type: "MOVE_WORK_ITEMS.SET_OPEN", payload: { workItemId, collectionId } }),
    close: () => moveWorkItemRef.send({ type: "MOVE_WORK_ITEMS.CLOSE" }),
    workItemData,
    workItems,
    initialCollection,
    currentCollection,
    selectedCollection,
    isMoveDisabled,
    moveWorkItem: () => moveWorkItemRef.send({ type: "MOVE_WORK_ITEMS.MOVE_ITEM" }),
    setCurrentCollectionId: (collectionId: string | null) =>
      moveWorkItemRef.send({ type: "MOVE_WORK_ITEMS.SET_COLLECTION_ID", payload: collectionId }),
    setSelectedCollectionId: (collectionId: string | null) =>
      moveWorkItemRef.send({ type: "MOVE_WORK_ITEMS.SET_SELECTED_COLLECTION", payload: collectionId }),
  };
};

const workItemDataSelector = (state: State) => state.context.workItemData;
const workItemsSelector = (state: State) => state.context.workItems;
const currentCollectionSelector = (state: State) => state.context.currentCollection;
const initialCollectionSelector = (state: State) => state.context.initialCollection;
const selectedCollectionSelector = (state: State) => state.context.selectedCollection;
const initialCollectionIdSelector = (state: State) => state.context.initialCollectionId;
const isOpenSelector = (state: State) => state.matches("open");
const isInitialLoadingSelector = (state: State) => state.matches("open.fetchInitialData");
const isCollectionLoadingSelector = (state: State) => state.matches("open.fetchCollectionData");

const partitionedAndSortedWorkItems = (workItems: WorkItem[]) =>
  workItems.sort((a, b) => {
    if (a.typename === "collection" && b.typename !== "collection") {
      return -1;
    } else if (a.typename !== "collection" && b.typename === "collection") {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

export const openMoveItemModal = ({
  workItemId,
  collectionId,
}: {
  workItemId: string;
  collectionId: string | null;
}) => {
  globalEvents$$.next({ type: "MOVE_WORK_ITEMS.SET_OPEN", payload: { workItemId, collectionId } });
};
