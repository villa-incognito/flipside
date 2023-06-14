import { GoogleNodeEndpoint, GoogleNodeEndpointNew } from "@fscrypto/domain/src/google-node-endpoint";
import { useSelector } from "@xstate/react";
import { Subject } from "rxjs";
import type { ActorRefFrom, AnyActorRef, StateFrom } from "xstate";
import { assign, createMachine, spawn, toActorRef } from "xstate";
import { actorSystem } from "~/state";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { CreateGoogleNodeEndpointEvent, createCreateGoogleEndpointObservable } from "./create-google-endpoint.async";
import { GetGoogleEndpointsEvent, createGetGoogleEndpointsObservable } from "./get-google-endpoints.async";
import { RemoveGoogleNodeEndpointEvent, createRemoveGoogleEndpointObservable } from "./remove-google-endpoint.async";

export const createGoogleNodeEndpointsMachine = () => {
  const create$$ = new Subject<GoogleNodeEndpointNew>();
  const get$$ = new Subject<void>();
  const remove$$ = new Subject<{ id: string }>();
  const machine = createMachine(
    {
      id: `google-node-integration`,
      tsTypes: {} as import("./google-node-endpoints.machine.typegen").Typegen0,
      schema: {
        context: {} as GoogleNodeEndpointsContext,
        events: {} as GoogleNodeEndpointsEvent | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        endpoints: [],
        removingId: null,
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
                "LIVE_QUERY.GOOGLE_NODE.GET_ENDPOINTS_SUCCESS": {
                  actions: "setGoogleNodeEndpoints",
                  target: "closed",
                },
              },
            },
            closed: {
              on: {
                "LIVE_QUERY.GOOGLE_NODE.OPEN_MODAL": "open",
              },
            },
            open: {
              initial: "idle",
              on: {
                "LIVE_QUERY.GOOGLE_NODE.CLOSE_MODAL": "closed",
                "LIVE_QUERY.GOOGLE_NODE.REMOVE_ENDPOINT_REQUEST": {
                  target: ".removing",
                  actions: ["removeEndpoint", "setRemovingId"],
                },
                "LIVE_QUERY.GOOGLE_NODE.TOGGLE_CREATE": ".creatingNew",
              },
              states: {
                idle: {
                  id: "idle",
                },
                removing: {
                  on: {
                    "LIVE_QUERY.GOOGLE_NODE.REMOVE_ENDPOINT_SUCCESS": {
                      target: "#idle",
                      actions: "setRemovedEndpoint",
                    },
                  },
                },
                creatingNew: {
                  initial: "editing",
                  states: {
                    editing: {
                      on: {
                        "LIVE_QUERY.GOOGLE_NODE.TOGGLE_CREATE": "#idle",
                        "LIVE_QUERY.GOOGLE_NODE.CREATE_ENDPOINT_REQUEST": {
                          target: "saving",
                          actions: "createNewEndpoint",
                        },
                      },
                    },
                    saving: {
                      entry: "createNewEndpoint",
                      on: {
                        "LIVE_QUERY.GOOGLE_NODE.CREATE_ENDPOINT_SUCCESS": {
                          target: "#idle",
                          actions: "setNewEndpoint",
                        },
                      },
                    },
                  },
                },
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
            createEndpoint$$: spawn(createCreateGoogleEndpointObservable(create$$)),
            getEndpoints$$: spawn(createGetGoogleEndpointsObservable(get$$)),
            removeEndpoint$$: spawn(createRemoveGoogleEndpointObservable(remove$$)),
          };
        }),
        createNewEndpoint: (context, event) => {
          create$$.next(event.payload);
        },
        getEndpoints: () => {
          get$$.next();
        },
        removeEndpoint: (_, event) => {
          remove$$.next(event.payload);
        },
        setGoogleNodeEndpoints: assign((_, event) => {
          return { endpoints: event.payload };
        }),
        setRemovingId: assign((_, event) => {
          return { removingId: event.payload.id };
        }),
        setRemovedEndpoint: assign((context, event) => {
          return {
            endpoints: context.endpoints.filter((endpoint) => endpoint.id !== event.payload.id),
            removingId: null,
          };
        }),
        setNewEndpoint: assign((context, event) => {
          return {
            endpoints: [...context.endpoints, event.payload],
          };
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

interface GoogleNodeEndpointsContext {
  endpoints: GoogleNodeEndpoint[];
  removingId: string | null;
  createEndpoint$$?: AnyActorRef;
  getEndpoints$$?: AnyActorRef;
  removeEndpoint$$?: AnyActorRef;
}

type GoogleNodeEndpointsEvent =
  | {
      type: "LIVE_QUERY.GOOGLE_NODE.OPEN_MODAL";
    }
  | { type: "LIVE_QUERY.GOOGLE_NODE.CLOSE_MODAL" }
  | { type: "LIVE_QUERY.GOOGLE_NODE.TOGGLE_CREATE" }
  | GetGoogleEndpointsEvent
  | CreateGoogleNodeEndpointEvent
  | RemoveGoogleNodeEndpointEvent;

export type GoogleNodeEndpointsActorRef = ActorRefFrom<ReturnType<typeof createGoogleNodeEndpointsMachine>>;
export type GoogleNodeEndpointsActorState = StateFrom<ReturnType<typeof createGoogleNodeEndpointsMachine>>;

export const useGoogleNodeEndpointsMachine = () => {
  const googleRef =
    actorSystem.get<GoogleNodeEndpointsActorRef>("googleNodeEndpoints") ?? toActorRef({ send: () => {} });
  const setOpen = (open: boolean) => {
    open
      ? googleRef.send({ type: "LIVE_QUERY.GOOGLE_NODE.OPEN_MODAL" })
      : googleRef.send({ type: "LIVE_QUERY.GOOGLE_NODE.CLOSE_MODAL" });
  };
  const removeEndpoint = (id: string) =>
    googleRef.send({ type: "LIVE_QUERY.GOOGLE_NODE.REMOVE_ENDPOINT_REQUEST", payload: { id } });
  const toggleCreateNew = () => googleRef.send({ type: "LIVE_QUERY.GOOGLE_NODE.TOGGLE_CREATE" });
  const saveNewEndpoint = (payload: GoogleNodeEndpointNew) =>
    googleRef.send({ type: "LIVE_QUERY.GOOGLE_NODE.CREATE_ENDPOINT_REQUEST", payload });

  return {
    setOpen,
    removeEndpoint,
    removingId: useSelector(googleRef, removingIdSelector),
    isOpen: useSelector(googleRef, isOpenSelector),
    endpoints: useSelector(googleRef, endpointsSelector),
    isLoading: useSelector(googleRef, loadingSelector),
    isCreatingNew: useSelector(googleRef, creatingNewSelector),
    toggleCreateNew,
    saveNewEndpoint,
    isSaving: useSelector(googleRef, isSavingSelector),
  };
};

const isOpenSelector = (state: GoogleNodeEndpointsActorState) => {
  return !!state?.matches("active.open");
};

const endpointsSelector = (state: GoogleNodeEndpointsActorState) => {
  return state?.context.endpoints ?? [];
};

const loadingSelector = (state: GoogleNodeEndpointsActorState) => {
  return state?.matches("active.loading");
};

const removingIdSelector = (state: GoogleNodeEndpointsActorState) => {
  return state?.context.removingId;
};

const creatingNewSelector = (state: GoogleNodeEndpointsActorState) => {
  return state?.matches("active.open.creatingNew");
};

const isSavingSelector = (state: GoogleNodeEndpointsActorState) => {
  return state?.matches("active.open.creatingNew.saving");
};
