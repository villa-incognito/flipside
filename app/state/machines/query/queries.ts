import { ActorRefFrom, assign, spawn, createMachine, StateFrom } from "xstate";
import { actorSystem } from "~/state/system";
import { createQueryMachine, QueryActorRef } from "./query";
import { Query } from "@fscrypto/domain/src/query";
import { User } from "@fscrypto/domain/src/user";
import { useSelector } from "@xstate/react";

export const createQueriesMachine = () => {
  const queriesMachine = createMachine(
    {
      id: "queryRun",
      predictableActionArguments: true,
      tsTypes: {} as import("./queries.typegen").Typegen0,
      schema: {
        context: {} as QueriesContext,
        events: {} as QueriesEvent,
      },
      context: {
        queries: [],
      },
      on: {
        "QUERIES.UNMOUNT_EDITORS": {
          description:
            "Unmount all editors except the one with the given queryId. This makes sure that the editor that is being edited is not unmounted.",
          actions: ["unmountEditors"],
        },
        "QUERIES.ADD": {
          actions: ["addQuery"],
        },
      },
      initial: "idle",
      states: {
        idle: {},
      },
    },
    {
      actions: {
        addQuery: assign((ctx, event) => {
          const { query, owner, isPublic } = event.payload;
          const existing = ctx.queries.find((q) => q.getSnapshot()!.context.query.id === query.id);
          if (existing) return {};
          const queryRef = spawn(createQueryMachine(query, owner, isPublic), { sync: true, name: `query-${query.id}` });
          actorSystem.register(queryRef, `query-${query.id}`);
          return {
            queries: [...ctx.queries, queryRef],
          };
        }),
        unmountEditors: (ctx, ev) => {
          const queries = ctx.queries.filter((q) => q.getSnapshot()!.context.query.id !== ev.queryId);
          queries.forEach((q) => {
            const codeMirrorRef = q.getSnapshot()?.context.codeMirrorRef;
            codeMirrorRef?.send({ type: "CODE_MIRROR.UNMOUNT" });
          });
        },
      },
    }
  );

  return queriesMachine;
};

interface QueriesContext {
  queries: QueryActorRef[];
}

type QueriesEvent =
  | { type: "QUERIES.ADD"; payload: { query: Query; owner: User; isPublic: boolean } }
  | { type: "QUERIES.UNMOUNT_EDITORS"; queryId: string };

export type QueriesActorRef = ActorRefFrom<ReturnType<typeof createQueriesMachine>>;
type State = StateFrom<ReturnType<typeof createQueriesMachine>>;

const queries = (state: State) => state.context.queries.map((q) => q.getSnapshot()!.context.query);
export const useQueries = () => {
  const ref = actorSystem.get<QueriesActorRef>("queries")!;
  return {
    queries: useSelector(ref, queries),
    initializeOwnerQuery: (query: Query, owner: User) =>
      ref.send({ type: "QUERIES.ADD", payload: { query, owner, isPublic: false } }),
    initializePublicQuery: (query: Query, owner: User) =>
      ref.send({ type: "QUERIES.ADD", payload: { query, owner, isPublic: true } }),
  };
};
