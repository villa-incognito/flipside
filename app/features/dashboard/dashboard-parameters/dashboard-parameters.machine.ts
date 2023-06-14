import type { query } from "@fscrypto/domain";
import type { ActorRefFrom, StateFrom } from "xstate";
import { createMachine, assign, toActorRef } from "xstate";
import { $path } from "remix-routes";
import { actorSystem } from "~/state";
import { useSelector } from "@xstate/react";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { type DashboardActorRef } from "../dashboard.machine";

interface CreateParametersMachineProps {
  dashboardId: string;
}

export const createParametersMachine = ({ dashboardId }: CreateParametersMachineProps) => {
  const machine = createMachine(
    {
      tsTypes: {} as import("./dashboard-parameters.machine.typegen").Typegen0,
      schema: {
        context: {} as ParametersContext,
        events: {} as ParametersEvent | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        parameters: [] as CustomParameter[],
        dashboardId,
      },
      initial: "loading",
      states: {
        loading: {
          invoke: {
            id: "fetchParameters",
            src: "fetchParameters",
            onDone: {
              target: "idle",
              actions: "updateParams",
            },
          },
        },
        idle: {
          on: {
            "DASHBOARD.PARAMETERS.REFETCH_PARAMETERS": {
              target: "refetch",
              cond: "isDashboardId",
            },
            "DASHBOARD.PARAMETERS.UPDATE_PARAMETER": {
              actions: ["updateParameter"],
            },
            "DASHBOARD.PARAMETERS.APPLY_PARAMETERS": {
              actions: ["applyParameters"],
              target: "disabled",
            },
          },
        },
        disabled: {
          after: { 5000: "idle" },
        },
        refetch: {
          after: {
            3000: "loading",
          },
        },
      },
    },
    {
      actions: {
        updateParams: assign((context, event) => {
          return {
            parameters: event.data.parameters.map((x) => {
              return {
                ...x,
                customValue: context.parameters.find((y) => y.name === x.name)?.customValue ?? x.value,
              };
            }),
          };
        }),
        updateParameter: assign((context, event) => {
          const { name, value } = event;
          const updatedParams = context.parameters.map((x) =>
            x.name === name ? { ...x, customValue: value, value } : x
          );
          return {
            parameters: updatedParams,
          };
        }),
        applyParameters: (context) => {
          const { parameters } = context;
          globalEvents$$.next({
            type: "DASHBOARD.PARAMETERS.APPLY_PARAMETERS",
            payload: { dashboardId: dashboardId, parameters },
          });
        },
      },
      services: {
        fetchParameters: (context) => {
          const url =
            window.location.protocol +
            "//" +
            window.location.host +
            $path("/api/dashboards/:id/parameters/get", { id: context.dashboardId });
          return fetch(url, {
            method: "get",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((response) => response.json());
        },
        globalEvents: () => globalEvents$$,
      },
      guards: {
        isDashboardId: (context, event) => {
          return event.dashboardId === context.dashboardId;
        },
      },
    }
  );
  return machine;
};

export type CustomParameter = query.QueryParameter & { customValue: string };
export const isCustomParameter = (x: unknown): x is CustomParameter =>
  (x as { customValue: string }).customValue !== undefined;

interface ParametersContext {
  parameters: CustomParameter[];
  dashboardId: string;
}

type ParametersEvent =
  | {
      type: "done.invoke.fetchParameters";
      data: {
        parameters: CustomParameter[];
      };
    }
  | {
      type: "DASHBOARD.PARAMETERS.UPDATE_PARAMETER";
      name: string;
      value: string;
    }
  | {
      type: "DASHBOARD.PARAMETERS.APPLY_PARAMETERS";
    };

export type GlobalDashboardParametersEvent =
  | {
      type: "DASHBOARD.PARAMETERS.APPLY_PARAMETERS";
      payload: {
        dashboardId: string;
        parameters: CustomParameter[];
      };
    }
  | {
      type: "DASHBOARD.PARAMETERS.REFETCH_PARAMETERS";
      dashboardId: string;
    };

export type DashboardParametersActorRef = ActorRefFrom<ReturnType<typeof createParametersMachine>>;
export type DashboardParametersState = StateFrom<ReturnType<typeof createParametersMachine>>;

export const useDashboardParameters = (dashboardId: string) => {
  const baseRef = actorSystem.get<DashboardActorRef>(`dashboard-${dashboardId}`);
  const dashboardRef = baseRef ?? toActorRef({ send: () => {} });
  const dashboardParametersRef =
    dashboardRef?.getSnapshot()?.context.dashboardParameters ?? toActorRef({ send: () => {} });

  const updateParameter = (name: string, value: string) =>
    dashboardParametersRef.send({ type: "DASHBOARD.PARAMETERS.UPDATE_PARAMETER", name, value });
  const applyParameters = () => dashboardParametersRef.send({ type: "DASHBOARD.PARAMETERS.APPLY_PARAMETERS" });
  return {
    parameters: useSelector(dashboardParametersRef, parametersSelector),
    isDisabled: useSelector(dashboardParametersRef, disabledSelector),
    updateParameter,
    applyParameters,
  };
};

const parametersSelector = (state: DashboardParametersState) => {
  return state.context.parameters;
};

const disabledSelector = (state: DashboardParametersState) => {
  return state.matches("disabled");
};
