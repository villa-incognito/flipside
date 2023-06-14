import { ActorRefFrom, AnyActorRef, assign, createMachine, spawn } from "xstate";
import { GenericEntityEvent } from "../../types";
import type { Query, QueryUpdate } from "@fscrypto/domain/src/query";
import { query as queryDomain } from "@fscrypto/domain";
import { createCodeMirrorMachine } from "~/features/query/machines/code-mirror-machine";
import { User } from "@fscrypto/domain/src/user";
import { createPanelSizeMachine } from "~/features/query/machines/panel-size-machine";
import { createQuerySelectionMachine } from "~/features/query/machines/selection-machine";
import { createResultsPanelMachine } from "~/features/query/machines/results-panel-machine";
import { createParametersMachine } from "~/features/query/query-parameters/parameters.machine";
import deepEquals from "fast-deep-equal";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { Subject } from "rxjs";
import { createUpdateObservable, QueryUpdateEvent } from "./update";
import { useActorFromSystem, useActorFromRef } from "~/state/hooks";

export const createQueryMachine = (query: Query, owner: User, isPublic: boolean) => {
  // A subject that is used to trigger an update of the query
  const update$$ = new Subject<void>();
  const queryMachine = createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QEcCuYBOBPAdASwgBswBiARQFUBRAJQE0cKAFAEQEEAVKgbQAYBdRKAAOAe1h4ALnlEA7ISAAeiACwBmFTl4qAbAA4A7AFYANCCyIATAE5NKo2oCMlowF9XZtJlywwk1MIkfIJIIGIS0nIKygiOagY4apa8Ti5mFrHWOjg6uXn5edbunujYOL7+gdyOISLiUjLyoTFxCUkpzqbmVnp6OY7WBtaOBToGxSBeZRBgAEaiqLIAxniyUOTU9IysnDwCCuENUc2IOrzZOtYOnelWlmo4BpY6RjouE1O4M-OLK2skilgkgAhpIwDhgQAzMEYAAURl4vAAlCRPjhvgtlqsoMEDvVIk1QDEDENEupjLcEElso4hvpjB9Sj5gQA3bEkCBycGrFmiADW4ICEFBYFxoUOBOiiBJ1jJ8S6GT0jhwbgmslEM3goU+eIijSlCAAtDpKcbGd58EQwLqjoSlIgNJYcPdLkMRvkDJS1LxZXpdGojCp3Xlxh5Jkzyn4AjbJScECpLF6UjgE1lDKqShaMb9sTH9XG3k7016XDhaWmGWG0bBWbnxfj80TENYNGWrqkFT0+s9vck9GoB4PzWVhKhZoQ8Es88cm1SA-0DI5i90EJZaTg9C3LDZg4V3O4gA */
      id: "query",
      predictableActionArguments: true,
      tsTypes: {} as import("./query.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Event,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        query,
        owner,
      },
      initial: "setup",
      on: {
        "QUERY.DELETE": {
          actions: ["deleteQuery"],
        },
        "WORK_ITEM.UPDATE_REQUEST": {
          description: "when the work item is updated we want to optimistically update the query name",
          actions: ["externalSetName"],
          cond: "isWorkItemId",
        },
        "WORK_ITEM.UPDATE_SUCCESS": {
          description: "when the work item has saved, we need to make sure the latest updatedAt is set",
          actions: ["externalSetUpdatedAt"],
          cond: "isWorkItemId",
        },
        "WORK_ITEM.MOVE_REQUEST": {
          actions: ["externalSetCollectionId"],
          cond: "isWorkItemId",
        },
        "WORK_ITEM.MOVE_SUCCESS": {
          actions: ["externalSetUpdatedAt"],
          cond: "isWorkItemId",
        },
        "QUERY.UPDATE_REQUEST": {
          actions: ["setQuery", "updateQuery"],
          cond: "hasChanged",
          target: "saving",
        },
        "QUERY.UPDATE_SUCCESS": {
          actions: ["handleUpdateSuccess"],
          target: "idle",
        },
        "QUERY.UPDATE_FAILURE": {
          actions: ["handleUpdateFailure"],
          target: "idle",
        },
      },
      states: {
        idle: {},
        saving: {},
        setup: {
          always: [
            {
              target: "public",
              actions: ["setupChildMachines"],
              cond: "isPublic",
            },
            {
              target: "idle",
              actions: ["setupChildMachines"],
            },
          ],
        },
        public: {},
      },
    },
    {
      actions: {
        deleteQuery: (ctx) => {
          globalEvents$$.next({
            type: "QUERY.DELETE_REQUEST",
            queryId: ctx.query.id,
          });
        },
        setupChildMachines: assign((context) => {
          return {
            codeMirrorRef: spawn(createCodeMirrorMachine({ queryId: context.query.id })),
            panelSizeRef: spawn(
              createPanelSizeMachine({ queryId: context.query.id, ratios: context.query.meta?.panel })
            ),
            selectionRef: spawn(createQuerySelectionMachine({ queryId: context.query.id })),
            resultsPanelRef: spawn(createResultsPanelMachine(query.id)),
            parametersRef: spawn(
              createParametersMachine({
                queryId: context.query.id,
                parameters: context.query.parameters,
                statement: context.query.statement,
              })
            ),
            update$: spawn(createUpdateObservable(update$$, context.query.id)),
          };
        }),
        externalSetName: assign((context, event) => {
          return {
            query: { ...context.query, name: event.payload.name },
          };
        }),
        externalSetCollectionId: assign((context, event) => {
          return {
            query: { ...context.query, queryCollectionId: event.payload.parentId },
          };
        }),
        externalSetUpdatedAt: assign((context, event) => {
          return {
            query: { ...context.query, updatedAt: event.payload.updatedAt, lastSavedAt: event.payload.updatedAt },
          };
        }),
        setQuery: assign((ctx, event) => {
          const query = event.payload;
          //this is temporary until the query machine has the same uplift as dashboards
          if (event.payload.name) {
            globalEvents$$.next({
              type: "QUERY.SET_NAME",
              payload: event.payload.name,
              queryId: ctx.query.id,
            });
          }
          return {
            query: {
              ...ctx.query,
              ...query,
            },
          };
        }),
        updateQuery: () => {
          update$$.next();
        },
        handleUpdateSuccess: assign((ctx, event) => {
          if (!event.payload) return {};
          return {
            query: {
              ...ctx.query,
              parameters: event.payload.parameters,
              lastSavedAt: event.payload.lastSavedAt,
            },
          };
        }),
        handleUpdateFailure: (_ctx, event) => {
          if ((event.error as { status: number }).status === 409) {
            globalEvents$$.next({
              type: "TOAST.NOTIFY",
              notif: {
                type: "warning",
                timeout: 10000,
                title:
                  "Your query is out of date. Please refresh this page to get the latest query. Copy your work before refreshing to ensure you don't lose any changes.",
              },
            });
          }
        },
      },
      services: {
        globalEvents: () => globalEvents$$,
      },
      guards: {
        isPublic: () => isPublic,
        isWorkItemId: (context, event) => {
          return context.query.id === event.id;
        },
        hasChanged: (context, event) => {
          const updatePayload = queryDomain.updateSchema.parse(event.payload);
          const changedKeys = Object.keys(updatePayload) as (keyof QueryUpdate)[];
          return changedKeys.length > 0 && changedKeys.some((k) => !deepEquals(updatePayload[k], context.query[k]));
        },
      },
    }
  );

  return queryMachine;
};

interface Context {
  query: Query;
  owner: User;
  codeMirrorRef?: ActorRefFrom<ReturnType<typeof createCodeMirrorMachine>>;
  panelSizeRef?: ActorRefFrom<ReturnType<typeof createPanelSizeMachine>>;
  selectionRef?: ActorRefFrom<ReturnType<typeof createQuerySelectionMachine>>;
  resultsPanelRef?: ActorRefFrom<ReturnType<typeof createResultsPanelMachine>>;
  parametersRef?: ActorRefFrom<ReturnType<typeof createParametersMachine>>;
  update$?: AnyActorRef;
}

type Event =
  | { type: "QUERY.UPDATE_REQUEST"; payload: Partial<Query> }
  | { type: "QUERY.DELETE" }
  | GenericEntityEvent<"query", "ADD_RESULT", Query>
  | { type: "done.invoke.update"; data: Query | null }
  | { type: "done.invoke.load"; data: Query | null }
  | QueryUpdateEvent
  | GlobalEvent;

export type GlobalQueryEvent =
  | {
      type: "QUERY.SET_NAME";
      payload: string;
      queryId: string;
    }
  | {
      type: "QUERY.DELETE_REQUEST";
      queryId: string;
    };

export type QueryActorRef = ActorRefFrom<ReturnType<typeof createQueryMachine>>;

export const useQuery = (id: string) => {
  const [state, ref] = useActorFromSystem<QueryActorRef>(`query-${id}`);
  const [selectionState] = useActorFromRef(ref?.getSnapshot()?.context.selectionRef);
  if (!state || !selectionState) return undefined;
  const hasSelection = selectionState.context.selection.length > 0;
  return {
    query: state.context.query,
    owner: state.context.owner,
    update: (payload: Partial<QueryUpdate>) => ref.send({ type: "QUERY.UPDATE_REQUEST", payload }),
    hasSelection,
    isSaving: state.matches("saving"),
    addToStatement: (statement: string) =>
      ref.getSnapshot()?.context.codeMirrorRef?.send({ type: "CODE_MIRROR.ADD_TO_STATEMENT", payload: statement }),
    formatStatement: () => ref.getSnapshot()?.context.codeMirrorRef?.send({ type: "CODE_MIRROR.FORMAT_STATEMENT" }),
    remove: () => ref.send({ type: "QUERY.DELETE" }),
  };
};
