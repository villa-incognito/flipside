import { QuickNodeEndpoint } from "@fscrypto/domain/src/quicknode-endpoint";
import { useSelector } from "@xstate/react";
import type { ActorRefFrom, AnyActorRef, StateFrom } from "xstate";
import { assign, createMachine, spawn, toActorRef } from "xstate";
import { actorSystem } from "~/state";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { Subject } from "rxjs";
import { GetQuickNodeEndpointsEvent, createGetQuickNodeEndpointsObservable } from "./get-quicknode-endpoints.async";

export const createQuickNodeEndpointsMachine = () => {
  const get$$ = new Subject<void>();
  const machine = createMachine(
    {
      id: `quick-node-integration`,
      tsTypes: {} as import("./quick-node-endpoints.machine.typegen").Typegen0,
      schema: {
        context: {} as QuickNodeIntegrationContext,
        events: {} as QuickNodeEndpointsEvent | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        endpoints: [],
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
              entry: ["spawnObservables", "getEndpoints"],
              on: {
                "LIVE_QUERY.QUICK_NODE.GET_ENDPOINTS_SUCCESS": {
                  actions: "setQuickNodeEndpoints",
                  target: "closed",
                },
              },
            },
            closed: {
              on: {
                "LIVE_QUERY.QUICK_NODE.OPEN_MODAL": "open",
              },
            },
            open: {
              on: {
                "LIVE_QUERY.QUICK_NODE.CLOSE_MODAL": "closed",
              },
            },
          },
        },
      },
      on: {},
    },
    {
      actions: {
        spawnObservables: assign((_) => {
          return {
            getEndpoints$$: spawn(createGetQuickNodeEndpointsObservable(get$$)),
          };
        }),
        getEndpoints: () => {
          get$$.next();
        },
        setQuickNodeEndpoints: assign((_, event) => {
          return { endpoints: event.payload };
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

interface QuickNodeIntegrationContext {
  endpoints: QuickNodeEndpoint[];
  getEndpoints$$?: AnyActorRef;
}

type QuickNodeEndpointsEvent =
  | {
      type: "LIVE_QUERY.QUICK_NODE.OPEN_MODAL";
    }
  | { type: "LIVE_QUERY.QUICK_NODE.CLOSE_MODAL" }
  | GetQuickNodeEndpointsEvent;

export type QuickNodeEndpointsActorRef = ActorRefFrom<ReturnType<typeof createQuickNodeEndpointsMachine>>;
export type QuickNodeEndpointsActorState = StateFrom<ReturnType<typeof createQuickNodeEndpointsMachine>>;

export const useQuickNodeEndpointsMachine = () => {
  const quickNodeRef =
    actorSystem.get<QuickNodeEndpointsActorRef>("quickNodeEndpoints") ?? toActorRef({ send: () => {} });
  const setOpen = (open: boolean) => {
    open
      ? quickNodeRef.send({ type: "LIVE_QUERY.QUICK_NODE.OPEN_MODAL" })
      : quickNodeRef.send({ type: "LIVE_QUERY.QUICK_NODE.CLOSE_MODAL" });
  };
  return {
    setOpen,
    isOpen: useSelector(quickNodeRef, isOpenSelector),
    endpoints: useSelector(quickNodeRef, endpointsSelector),
    isLoading: useSelector(quickNodeRef, loadingSelector),
  };
};

const isOpenSelector = (state: QuickNodeEndpointsActorState) => {
  return !!state?.matches("active.open");
};

const endpointsSelector = (state: QuickNodeEndpointsActorState) => {
  return state?.context.endpoints ?? [];
};

const loadingSelector = (state: QuickNodeEndpointsActorState) => {
  return state?.matches("active.loading");
};
