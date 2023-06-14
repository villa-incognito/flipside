import { FunctionSchema } from "@fscrypto/domain/src/data-schema";
import { useSelector } from "@xstate/react";
import type { ActorRefFrom, AnyActorRef, StateFrom } from "xstate";
import { assign, createMachine, spawn, toActorRef } from "xstate";
import { actorSystem } from "~/state";
import { GlobalEvent, globalEvents$$ } from "~/state/events";

import { Subject } from "rxjs";
import { GetFunctionSchemaEvent, createGetFunctionSchemasObservable } from "./functions/get-schema-functions.async";
import { createChainSchemaMap } from "./utils/create-schema-map";
import { dummyData } from "./utils/dummyFunctionSchema";
import { QuickNodeEndpointsActorState } from "./quick-node/quick-node-endpoints.machine";
import { LiveQueryProviderType } from "@fscrypto/domain/src/livequery";

export const createLiveQueryMachine = () => {
  const getFunctionSchemas$$ = new Subject<void>();
  const machine = createMachine(
    {
      id: `live-query-integrations`,
      tsTypes: {} as import("./live-query.machine.typegen").Typegen0,
      schema: {
        context: {} as LiveQueryContext,
        events: {} as LiveQueryEvent | GlobalEvent,
      },
      predictableActionArguments: true,
      context: {
        mainOnly: true,
        // this is a map of chain_network to function schemas
        schemas: {},
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      initial: "inactive",
      states: {
        inactive: {
          on: {
            "STUDIO.ACTIVATE": "active",
          },
        },
        active: {
          initial: "loading",
          states: {
            loading: {
              entry: ["spawnObservables", "getFunctionSchemas"],
              on: {
                "LIVE_QUERY.FUNCTION_SCHEMAS.GET_SUCCESS": {
                  target: "idle",
                  actions: "setInitialFunctions",
                },
              },
            },
            idle: {},
          },
        },
      },
    },
    {
      actions: {
        spawnObservables: assign((_) => {
          return {
            getFunctionSchemas$$: spawn(createGetFunctionSchemasObservable(getFunctionSchemas$$)),
          };
        }),
        getFunctionSchemas: () => {
          getFunctionSchemas$$.next();
        },
        setInitialFunctions: assign((_) => {
          // This will be using dummy data for now
          const schemaMap = createChainSchemaMap(dummyData);

          return { schemas: schemaMap };
        }),
      },
      services: {
        globalEvents: () => globalEvents$$,
      },
      guards: {},
    }
  );
  return machine;
};

interface LiveQueryContext {
  schemas: Record<string, FunctionSchema[]>;
  getFunctionSchemas$$?: AnyActorRef;
  mainOnly: boolean;
}

type LiveQueryEvent =
  | GetFunctionSchemaEvent
  | {
      type: "done.invoke.fetchLiveQueryFunctions";
      data: { functions: FunctionSchema[] };
    };

export type LiveQueryActorRef = ActorRefFrom<ReturnType<typeof createLiveQueryMachine>>;
export type LiveQueryActorState = StateFrom<ReturnType<typeof createLiveQueryMachine>>;

export const useLiveQueryMachine = () => {
  const liveQueryRef = actorSystem.get("liveQuery") ?? toActorRef({ send: () => {} });

  const schemas = useSelector(liveQueryRef, schemasSelector);
  const isLoading = useSelector(liveQueryRef, isLoadingSelector);
  const isMainOnly = useSelector(liveQueryRef, isMainOnlySelector);
  return {
    schemas,
    isLoading,
    isMainOnly,
  };
};

const schemasSelector = (state: LiveQueryActorState) => state.context.schemas;
const isLoadingSelector = (state: LiveQueryActorState) => state.matches("active.loading");
const isMainOnlySelector = (state: LiveQueryActorState) => state.context.mainOnly;

// This hook is used to determine which providers have been configured by the user and can be selected in the query editor
export const useLiveQueryProviders = () => {
  const quickNodeEndpointsRef = actorSystem.get("quickNodeEndpoints") ?? toActorRef({ send: () => {} });
  const googleNodeEndpointsRef = actorSystem.get("googleNodeEndpoints") ?? toActorRef({ send: () => {} });
  const hasQuickNodeEndpoints = useSelector(quickNodeEndpointsRef, hasQuickNodeEndpointsSelector);
  const hasGoogleEndpoints = useSelector(googleNodeEndpointsRef, hasGoogleEndpointsSelector);
  let nodes: LiveQueryProviderType[] = [];
  if (hasQuickNodeEndpoints) {
    nodes.push("quicknode");
  }
  if (hasGoogleEndpoints) {
    nodes.push("google");
  }
  return nodes;
};

const hasQuickNodeEndpointsSelector = (state: QuickNodeEndpointsActorState) => {
  return state.context.endpoints.length > 0;
};
const hasGoogleEndpointsSelector = (state: QuickNodeEndpointsActorState) => {
  return state.context.endpoints.length > 0;
};
