import { useSelector } from "@xstate/react";
import { ActorRefFrom, StateFrom, assign, createMachine, toActorRef } from "xstate";
import { actorSystem } from "~/state";
import { $path } from "remix-routes";
import { DashboardPublished } from "@fscrypto/domain/src/dashboard";
import { globalEvents$$ } from "~/state/events";
import { DashboardActorRef, DashboardState } from "../dashboard.machine";

export const createDashboardPublishControlsMachine = (publishedAt: Date | null, dashboardId: string) => {
  const machine = createMachine(
    {
      id: "DashboardPublishMachine",
      tsTypes: {} as import("./dashboard-publish-controls.machine.typegen").Typegen0,
      schema: {
        context: {} as DashboardContext,
        events: {} as DashboardPublishEvent,
      },
      context: {
        publishedAt: null,
      },
      initial: "initialize",
      states: {
        initialize: {
          always: [
            {
              target: "idle",
              actions: ["initializeData"],
            },
          ],
        },
        idle: {
          on: {
            "DASHBOARD.PUBLISH.PUBLISH_REQUEST": {
              target: "publishing",
              actions: ["publishUpdateOptimistic"],
            },
            "DASHBOARD.PUBLISH.UNPUBLISH_REQUEST": {
              target: "unpublishing",
              actions: ["unpublishUpdateOptimistic"],
            },
          },
        },
        publishingComplete: {
          on: {
            "DASHBOARD.PUBLISH.CLOSE_MODAL": "idle",
          },
        },
        publishing: {
          invoke: {
            id: "publishDashboard",
            src: "publishDashboard",
            onDone: {
              target: "publishingComplete",
              actions: ["setPublishedData", "broadcastPublished"],
            },
            onError: "error",
          },
        },
        unpublishing: {
          invoke: {
            id: "unpublishDashboard",
            src: "unpublishDashboard",
            onDone: {
              target: "idle",
              actions: ["broadcastUnpublished"],
            },
            onError: "error",
          },
        },
        error: {},
      },
    },
    {
      actions: {
        initializeData: assign((_) => {
          return {
            publishedAt: publishedAt,
          };
        }),
        publishUpdateOptimistic: assign((_) => {
          return {
            publishedAt: new Date(),
          };
        }),
        unpublishUpdateOptimistic: assign((_) => {
          return {
            publishedAt: null,
          };
        }),
        setPublishedData: assign((_, event) => {
          return {
            publishedDashboard: event.data,
          };
        }),
        broadcastPublished: (context, event) => {
          globalEvents$$.next({
            type: "DASHBOARD.PUBLISH.PUBLISH_SUCCESS",
            payload: {
              publishedAt: context.publishedAt!,
              updatedAt: new Date(event.data.updatedAt),
            },
            dashboardId: dashboardId,
          });
        },
        broadcastUnpublished: (context, event) => {
          globalEvents$$.next({
            type: "DASHBOARD.PUBLISH.UNPUBLISH_SUCCESS",
            payload: {
              publishedAt: null,
              updatedAt: new Date(event.data.updatedAt),
            },
            dashboardId: dashboardId,
          });
        },
      },
      services: {
        publishDashboard: async (_) => {
          const url =
            window.location.protocol +
            "//" +
            window.location.host +
            $path("/api/dashboards/:id/publish", { id: dashboardId });
          return fetch(url, {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => response.json());
        },
        unpublishDashboard: async (_) => {
          const url =
            window.location.protocol +
            "//" +
            window.location.host +
            $path("/api/dashboards/:id/unpublish", { id: dashboardId });
          return fetch(url, {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => response.json());
        },
      },
    }
  );
  return machine;
};

interface DashboardContext {
  publishedAt: Date | null;
  publishedDashboard?: DashboardPublished;
}

export type DashboardPublishActorRef = ActorRefFrom<ReturnType<typeof createDashboardPublishControlsMachine>>;
export type DashboardPublishState = StateFrom<ReturnType<typeof createDashboardPublishControlsMachine>>;

type DashboardPublishEvent =
  | {
      type: "DASHBOARD.PUBLISH.PUBLISH_REQUEST";
    }
  | {
      type: "DASHBOARD.PUBLISH.UNPUBLISH_REQUEST";
    }
  | {
      type: "DASHBOARD.PUBLISH.CLOSE_MODAL";
    }
  | {
      type: "done.invoke.publishDashboard";
      data: DashboardPublished;
    }
  | {
      type: "done.invoke.unpublishDashboard";
      data: DashboardPublished;
    };

export type GlobalDashboardPublishEvent =
  | {
      type: "DASHBOARD.PUBLISH.PUBLISH_SUCCESS";
      payload: {
        publishedAt: Date;
        updatedAt: Date;
      };
      dashboardId: string;
    }
  | {
      type: "DASHBOARD.PUBLISH.UNPUBLISH_SUCCESS";
      payload: {
        publishedAt: null;
        updatedAt: Date;
      };
      dashboardId: string;
    };

export const useDashboardPublishControlsMachine = ({ dashboardId }: { dashboardId: string }) => {
  const dashboardRef = actorSystem.get<DashboardActorRef>(`dashboard-${dashboardId}`) ?? toActorRef({ send: () => {} });
  const publishMachineRef = dashboardRef.getSnapshot()?.context.dashboardPublish ?? toActorRef({ send: () => {} });

  return {
    dashboard: useSelector(dashboardRef, dashboardDataSelector),
    isPublished: useSelector(publishMachineRef, isPublishedSelector),
    isPublishing: useSelector(publishMachineRef, isPublishingSelector),
    isPublishingComplete: useSelector(publishMachineRef, isPublishingCompleteSelector),
    onPublish: () => publishMachineRef.send({ type: "DASHBOARD.PUBLISH.PUBLISH_REQUEST" }),
    onUnpublish: () => publishMachineRef.send({ type: "DASHBOARD.PUBLISH.UNPUBLISH_REQUEST" }),
    onCloseModal: () => publishMachineRef.send({ type: "DASHBOARD.PUBLISH.CLOSE_MODAL" }),
    publishedData: useSelector(publishMachineRef, publishedDataSelector),
  };
};

const isPublishedSelector = (state: DashboardPublishState) => {
  return state?.context.publishedAt;
};

const isPublishingSelector = (state: DashboardPublishState) => {
  return state?.matches("publishing");
};

const isPublishingCompleteSelector = (state: DashboardPublishState) => {
  return state?.matches("publishingComplete");
};

const publishedDataSelector = (state: DashboardPublishState) => {
  return state?.context.publishedDashboard;
};

const dashboardDataSelector = (state: DashboardState) => {
  return state?.context.dashboard;
};
