import { ActorRefFrom, StateFrom, spawn, toActorRef } from "xstate";
import { createMachine, assign } from "xstate";
import type { queryRun } from "@fscrypto/domain";
import { $path } from "remix-routes";
import { QueryRunActorRef, createQueryRunMachine } from "~/state/machines";
import { actorSystem } from "~/state";
import { useSelector } from "@xstate/react";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { Dashboard } from "@fscrypto/domain/src/dashboard";
import { DashboardActorRef } from "../dashboard.machine";

interface CreateRefreshMachineProps {
  queries: RefreshQuery[];
  dashboardId: string;
  lastRefreshedAt?: Date;
}

export const createRefreshMachine = ({ queries, dashboardId, lastRefreshedAt }: CreateRefreshMachineProps) => {
  const machine = createMachine(
    {
      id: `RefreshMachine`,
      tsTypes: {} as import("./dashboard-refresh.machine.typegen").Typegen0,
      schema: {
        context: {} as RefreshContext,
        events: {} as RefreshEvent | GlobalEvent,
      },
      context: {
        queries,
        dashboardId,
        lastRefreshedAt,
      },
      initial: "idle",
      states: {
        idle: {
          on: {
            "DASHBOARD.REFRESH.REFRESH_DASHBOARD": "initiate",
          },
        },
        initiate: {
          entry: ["createQueryRunsForEachQuery"],
        },
        updateLastRefreshedAt: {
          invoke: {
            src: "updateLastRefreshedAt",
            id: "updateLastRefreshedAt",
            onDone: {
              target: "idle",
              actions: "informDashboardAllQueryRunsFinished",
            },
          },
        },
      },
      on: {
        QUERY_RUN_EXECUTED: {
          actions: ["queryRunExecuted", "informDashboardQueryRunExecuted"],
        },
        QUERY_RUN_FINISHED: [
          {
            actions: ["queryRunFinished"],
            cond: "allQueryRunsAreFinished",
            target: "updateLastRefreshedAt",
          },
          {
            actions: ["queryRunFinished"],
          },
        ],
      },
    },
    {
      actions: {
        queryRunExecuted: assign((context, event) => {
          return {
            queries: context.queries.map((query) => {
              if (query.id === event.queryId) {
                return {
                  ...query,
                  status: "running" as RefreshQuery["status"],
                };
              }
              return query;
            }),
          };
        }),
        queryRunFinished: assign((context, event) => {
          return {
            queries: context.queries.map((query) => {
              if (query.id === event.queryId) {
                return {
                  ...query,
                  status: "success" as RefreshQuery["status"],
                };
              }
              return query;
            }),
          };
        }),
        informDashboardAllQueryRunsFinished: (context, event) => {
          globalEvents$$.next({
            type: "DASHBOARD.REFRESH.REFRESH_FINISHED",
            payload: {
              dashboard: event.data,
              dashboardId,
            },
            dashboardId,
          });
        },
        informDashboardQueryRunExecuted: (_) => {
          globalEvents$$.next({
            type: "DASHBOARD.REFRESH.QUERY_RUN_EXECUTED",
            payload: {
              dashboardId,
            },
          });
        },
        createQueryRunsForEachQuery: assign((context) => {
          return {
            queries: context.queries.map((query) => {
              return {
                ...query,
                queryRunRef: spawn(
                  createQueryRunMachine({
                    statement: query.statement,
                    queryId: query.id,
                    init: true,
                  })
                ),
              };
            }),
          };
        }),
      },
      guards: {
        allQueryRunsAreFinished: (context, event) => {
          const remainingQueries = context.queries.filter((query) => query.id !== event.queryId);
          if (remainingQueries.length === 0) return true;
          return remainingQueries.every((query) => {
            return query.status === "success";
          });
        },
      },
      services: {
        updateLastRefreshedAt: (context) => {
          const url =
            window.location.protocol +
            "//" +
            window.location.host +
            $path("/api/dashboards/:id/set-last-refreshed-at", { id: context.dashboardId });
          return fetch(url, {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => {
            return response.json();
          });
        },
      },
    }
  );
  return machine;
};

interface RefreshContext {
  queries: RefreshQuery[];
  dashboardId: string;
  lastRefreshedAt?: Date;
}

type RefreshEvent =
  | {
      type: "DASHBOARD.REFRESH.REFRESH_DASHBOARD";
    }
  | {
      type: "QUERY_RUN_EXECUTED";
      queryId: string;
    }
  | {
      type: "QUERY_RUN_FINISHED";
      queryId: string;
    }
  | {
      type: "done.invoke.updateLastRefreshedAt";
      data: Dashboard;
    };

export type GlobalRefreshEvent =
  | {
      type: "DASHBOARD.REFRESH.REFRESH_FINISHED";
      payload: {
        dashboardId: string;
        dashboard: Dashboard;
      };
      dashboardId: string;
    }
  | {
      type: "DASHBOARD.REFRESH.QUERY_RUN_EXECUTED";
      payload: {
        dashboardId: string;
      };
    };

export type DashboardRefreshActorRef = ActorRefFrom<ReturnType<typeof createRefreshMachine>>;
export type DashboardRefreshActorState = StateFrom<ReturnType<typeof createRefreshMachine>>;

interface RefreshQuery {
  id: string;
  statement: string;
  queryRunRef?: QueryRunActorRef;
  latestData?: queryRun.QueryRun;
  status?: "idle" | "running" | "error" | "success";
}

export const useRefreshDashboardMachine = ({ dashboardId }: { dashboardId: string }) => {
  const baseRef = actorSystem.get<DashboardActorRef>(`dashboard-${dashboardId}`);
  const dashboardRef = baseRef ?? toActorRef({ send: () => {} });
  const dashboardRefreshRef = dashboardRef?.getSnapshot()?.context.dashboardRefresh ?? toActorRef({ send: () => {} });

  const refreshDashboard = () => dashboardRefreshRef.send("DASHBOARD.REFRESH.REFRESH_DASHBOARD");
  return {
    lastRefreshedAt: useSelector(dashboardRefreshRef, refreshedAtSelector),
    hasInitiated: useSelector(dashboardRefreshRef, hasInitiatedSelector),
    refreshDashboard,
  };
};

const refreshedAtSelector = (state: DashboardRefreshActorState) => {
  return state?.context.lastRefreshedAt;
};

const hasInitiatedSelector = (state: DashboardRefreshActorState) => {
  return state.matches("initiate");
};
