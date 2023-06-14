import { ActorRefFrom, assign, spawn, createMachine, StateFrom } from "xstate";
import { keyBy, pick } from "lodash";
import { queryRun } from "@fscrypto/domain";
import { CollectionEvent } from "../../types";
import { actorSystem } from "~/state/system";
import { createQueryRunMachine, QueryRunActorRef } from "./query-run";
import { useSelector } from "@xstate/react";
import { fetchQueryRunId } from "~/features/query/async/fetch-query-run-id";
import { QueryRun } from "@fscrypto/domain/src/query-run";
import { resetTableState } from "~/features/query/machines/table-state-machine";

type Event = CollectionEvent<"query_run", queryRun.QueryRun, queryRun.QueryRunNew> | QueryRunsEvent;
interface Context {
  queryRuns: QueryRunActorRef[];
}

export const createQueryRunsMachine = () => {
  const queryRunsMachine = createMachine(
    {
      id: "queryRun",
      predictableActionArguments: true,
      tsTypes: {} as import("./query-runs.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Event,
      },
      context: {
        queryRuns: [],
      },
      on: {
        "QUERY_RUNS.ADD": {
          actions: ["addQueryRun"],
        },
        // "QUERY_RUNS.ADD_MANY": {
        //   actions: ["addQueryRuns"],
        // },
        "QUERY_RUNS.CREATE_NEW": {
          target: "creatingNewRun",
        },
      },
      initial: "idle",
      states: {
        idle: {},
        creatingNewRun: {
          invoke: {
            id: "createNewRun",
            src: "createNewRun",
            onDone: {
              target: "idle",
              actions: ["addCreatedRun"],
            },
          },
        },
      },
    },
    {
      actions: {
        addQueryRun: assign((ctx, event) => {
          const queryRun = event.payload;
          const existing = ctx.queryRuns.find((q) => q.getSnapshot()!.context.queryRun?.queryId === queryRun.queryId);
          let queryRuns = ctx.queryRuns;
          if (existing) return {};
          const queryRunRef = spawn(createQueryRunMachine({ queryRun, queryId: queryRun.queryId }), {
            sync: true,
            name: `queryRun-${queryRun.id}`,
          });
          actorSystem.register(queryRunRef, `queryRun-${queryRun.id}`);
          return {
            queryRuns: [...queryRuns, queryRunRef],
          };
        }),
        addCreatedRun: assign((ctx, event) => {
          const queryRun = event.data;
          const existing = ctx.queryRuns.find((q) => q.getSnapshot()!.context.queryRun?.queryId === queryRun.queryId);
          let queryRuns = ctx.queryRuns;
          if (existing) {
            existing.stop?.();
            actorSystem.unregister(`queryRun-${queryRun.id}`);
            queryRuns = ctx.queryRuns.filter((q) => q.getSnapshot()!.context.queryRun?.id !== queryRun.id);
          }
          const queryRunRef = spawn(createQueryRunMachine({ queryRun, queryId: queryRun.queryId }), {
            sync: true,
            name: `queryRun-${queryRun.id}`,
          });
          actorSystem.register(queryRunRef, `queryRun-${queryRun.id}`);
          return {
            queryRuns: [...queryRuns, queryRunRef],
          };
        }),
        // addQueryRuns: assign((ctx, event) => {
        //   const queryIds = event.payload.map((q) => q.queryId);
        //   // Filter out any existing query runs for this query
        //   const filteredRuns = ctx.queryRuns.filter(
        //     (q) => !queryIds.includes(q.getSnapshot()!.context.queryRun.queryId)
        //   );
        //   const refs = event.payload.map((qr) =>
        //     spawn(createQueryRunMachine(qr), { sync: true, name: `queryRun-${qr.id}` })
        //   );
        //   refs.forEach((ref) => actorSystem.register(ref, `queryRun-${ref.getSnapshot()!.context.queryRun.id}`));
        //   return {
        //     queryRuns: [...filteredRuns, ...refs],
        //   };
        // }),
      },
      services: {
        createNewRun: (ctx, event) => {
          const queryId = event.payload.queryId;
          resetTableState(queryId, "realtime");
          const codeMirrorState = actorSystem
            .get(`query-${queryId}`)
            ?.getSnapshot()
            ?.context.codeMirrorRef?.getSnapshot();
          const statement = codeMirrorState?.context.editorState?.doc.toString() ?? "";
          return fetchQueryRunId(statement, queryId);
        },
      },
    }
  );

  return queryRunsMachine;
};

export type QueryRunsActorRef = ActorRefFrom<ReturnType<typeof createQueryRunsMachine>>;

type QueryRunsEvent =
  | {
      type: "QUERY_RUNS.CREATE_NEW";
      payload: { queryId: string };
    }
  | {
      type: "done.invoke.createNewRun";
      data: QueryRun;
    };

type State = StateFrom<ReturnType<typeof createQueryRunsMachine>>;
const queryRunIdsSelector = (state: State) => state.context.queryRuns.map((q) => q.getSnapshot()!.context.queryRun?.id);
const byQueryIdSelector = (state: State) => {
  const queryRuns = state.context.queryRuns.map((q) => pick(q.getSnapshot()!.context.queryRun, ["id", "queryId"]));
  return keyBy(queryRuns, (q) => q.queryId) as Record<string, { id: string; queryId: string }>;
};
export const useQueryRuns = () => {
  const ref = actorSystem.get<QueryRunsActorRef>("queryRuns")!;
  const queryRunIds = useSelector(ref, queryRunIdsSelector);
  const byQueryId = useSelector(ref, byQueryIdSelector);
  return {
    ids: queryRunIds,
    byQueryId,
    createNew: (queryId: string) => {
      ref.send({ type: "QUERY_RUNS.CREATE_NEW", payload: { queryId } });
    },
    add: (queryRun: queryRun.QueryRun) => ref.send({ type: "QUERY_RUNS.ADD", payload: queryRun }),
    // addMany: (queryRuns: queryRun.QueryRun[]) => ref.send({ type: "QUERY_RUNS.ADD_MANY", payload: queryRuns }),
  };
};
