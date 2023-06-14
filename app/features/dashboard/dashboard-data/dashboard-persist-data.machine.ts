import { Dashboard } from "@fscrypto/domain/src/dashboard";
import { ActorRefFrom, StateFrom, assign, createMachine, spawn } from "xstate";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { Subject, catchError, concatMap, debounceTime, delay, filter, from, map, of } from "rxjs";
import { updateDashboard } from "~/features/dashboard/util/update-dashboard";
import { actorSystem } from "~/state/system";

export const createPersistDataMachine = (id: string) => {
  const machine = createMachine(
    {
      id: "persist-data-machine",
      tsTypes: {} as import("./dashboard-persist-data.machine.typegen").Typegen0,
      schema: {
        context: {} as PersistDataContext,
        events: {} as PersistDataEvent | GlobalEvent,
      },
      context: {
        id,
        dataObservable: null,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      initial: "initial",
      states: {
        initial: {
          always: {
            target: "idle",
            actions: "initializeObservable",
          },
        },
        idle: {},
        complete: {
          after: {
            500: "idle",
          },
        },
        saving: {},
      },
      on: {
        "DASHBOARD.UPDATE_REQUEST": {
          target: "saving",
          actions: ["persistData"],
          cond: "isDashboardId",
        },
        "DASHBOARD.PERSIST.UPDATE_FAILURE": {
          target: "idle",
          actions: ["handleError"],
        },
        "DASHBOARD.PERSIST.UPDATE_SUCCESS": {
          actions: "broadcastUpdateSuccess",
          target: "complete",
        },
      },
    },
    {
      actions: {
        broadcastUpdateSuccess: (context, event) => {
          globalEvents$$.next({
            type: "DASHBOARD.UPDATE_SUCCESS",
            payload: { dashboard: event.payload },
            dashboardId: context.id,
          });
        },
        persistData: (context) => {
          updateDataSubject$$.next({
            type: "DASHBOARD.PERSIST.UPDATE_REQUEST",
            payload: { id: context.id },
          });
        },
        initializeObservable: assign((_) => {
          const dataObservable = spawn(createUpdateDataObservable(actorSystem, id)) as DataObservable;
          return {
            dataObservable,
          };
        }),
        handleError: (context, event) => {
          console.log(event);
          if (event.payload.status === 409) {
            globalEvents$$.next({
              type: "TOAST.NOTIFY",
              notif: {
                type: "warning",
                timeout: 10000,
                title: "Your dashboard is out of date. Please refresh this page to get the latest dashboard",
              },
            });
          } else {
            globalEvents$$.next({
              type: "TOAST.NOTIFY",
              notif: { title: "Unable to save dashboard", type: "error" },
            });
          }
        },
      },
      services: {
        globalEvents: () => globalEvents$$,
      },
      guards: {
        isDashboardId: (context, event) => {
          return event.dashboardId === context.id;
        },
      },
    }
  );
  return machine;
};

interface PersistDataContext {
  id: string;
  dataObservable: DataObservable | null;
}

export type PersistDataActorRef = ActorRefFrom<ReturnType<typeof createPersistDataMachine>>;
export type PersistDataState = StateFrom<ReturnType<typeof createPersistDataMachine>>;

type PersistDataEvent =
  | {
      type: "DASHBOARD.PERSIST.UPDATE_SUCCESS";
      payload: Dashboard;
    }
  | {
      type: "DASHBOARD.PERSIST.UPDATE_FAILURE";
      payload: { status: number; message: string };
    };

type DataObservable = ActorRefFrom<ReturnType<typeof createUpdateDataObservable>>;

type UpdateDataObservableEvent = {
  type: "DASHBOARD.PERSIST.UPDATE_REQUEST";
  payload: {
    id: string;
  };
};

const updateDataSubject$$ = new Subject<UpdateDataObservableEvent>();

const createUpdateDataObservable = (system: typeof actorSystem, id: string) => {
  return updateDataSubject$$.pipe(
    // Filter to only emit events for this specific dashboard
    filter((eventData) => eventData.payload.id === id),
    // Debounce the stream to ensure we only save once per second
    debounceTime(1000),
    // Retrieve the current dashboard data
    concatMap((eventData) => {
      const dashboardActor = system.get(`dashboard-${eventData.payload.id}`);
      const currentData = dashboardActor?.getSnapshot()?.context.dashboard as Dashboard;

      // Save the dashboard by calling the updateDashboard function
      return from(updateDashboard(eventData.payload.id, currentData)).pipe(
        // Map the result of the update to the appropriate success event
        map((payload) => ({ type: "DASHBOARD.PERSIST.UPDATE_SUCCESS", payload })),
        // add a delay to ensure the success event is updated
        delay(100),
        // Catch any errors that occur and map them to the appropriate failure event
        catchError((payload) => of({ type: "DASHBOARD.PERSIST.UPDATE_FAILURE", payload }))
      );
    })
  );
};
