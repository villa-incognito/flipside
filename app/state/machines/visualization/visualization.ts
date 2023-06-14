import { visualization } from "@fscrypto/domain";
import { ActorRefFrom, createMachine, sendParent, assign } from "xstate";
import { EntityEvent, GenericEntityEvent } from "~/state/types";
import { tracking } from "~/utils/tracking";
import { deleteVisualization, updateVisualization } from "./requests";
import { actorSystem } from "~/state";
import { WorkItemActorRef } from "../work-items/work-item";
import { WorkItemsActorRef } from "../work-items/work-items";
import { useActorFromSystem } from "~/state/hooks";

type VisualizationEvent =
  | EntityEvent<"visualization", visualization.Visualization, visualization.VisualizationUpdate>
  | GenericEntityEvent<"visualization", "update_title", { title: string }>
  | { type: "done.invoke.visualization.deleting"; data: never };
interface VisualizationContext {
  visualization: visualization.Visualization;
  onDone?: (v: visualization.Visualization) => void;
}
export type VisualizationActorRef = ActorRefFrom<ReturnType<typeof createVisualizationMachine>>;

export const createVisualizationMachine = (vis: visualization.Visualization) => {
  const visualizationMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QDcCWsCuBDANqgXlgC6oD2AdgHSoQ5gDEAagJIDKAqgIIAyzAWpwAqzAPIA5SuwAKAESEBRANoAGALqJQAB1KxUJChpAAPRAEYALMsoBWADQgAnmYDMAdhsAOZ95+-npgF8A+zRMXAJiMioaOiY2Ll4BYXFKGXlueUElNUNtXX1yQxMECys7R0QAJmdzSmVnADZzay8-fyCQ9Gw8QgLKWCw0cih6CAowanJkUgBrCYxNCGIwRi7w3qiVdSQQPL0oorNrZ0p-SvKnBABOK2VWtt8OkFDuiL6IMDoSYdHxyem5pQXutIhRKB8vqhhggodMAMag8hbLa5HT7Aw7YquBoNSiuayuDymc72S7Vaw2RrNe6+QJPcikD7wHbAnqI1H5A6YxAAWgapN5DSerLeUWotDAHPRhW5CHMlQF13c1Iej2CzzWbL6AyGUClBUOCGcHkqlAazkqRJJFQQRJsws1orBELA3z1Oz2Btl5nMHkoVouVVMpjqVJaDzpnTCWrFLqIkH1XNAxSuVxD5iulVMHnxitMV1xhKa4badKCQA */
    createMachine(
      {
        predictableActionArguments: true,
        id: "visualization",
        tsTypes: {} as import("./visualization.typegen").Typegen0,
        schema: {
          context: {} as VisualizationContext,
          events: {} as VisualizationEvent,
        },
        context: {
          visualization: vis,
        },
        on: {
          "VISUALIZATION.UPDATE": {
            actions: ["updateVisualization"],
            target: "debouncing",
          },
          "VISUALIZATION.UPDATE_TITLE": {
            actions: ["updateTitle"],
            target: "debouncing",
          },
        },
        initial: "idle",
        states: {
          idle: {
            on: {
              "VISUALIZATION.DELETE": {
                target: "deleting",
              },
            },
          },
          debouncing: {
            after: {
              1000: {
                target: "saving",
              },
            },
          },
          saving: {
            invoke: {
              id: "update",
              src: "update",
              onDone: {
                target: "idle",
              },
            },
          },
          deleting: {
            entry: ["removeWorkItem"],
            invoke: {
              id: "delete",
              src: "delete",
              onDone: "deleted",
            },
          },
          deleted: {
            entry: ["trackingDelete", "deleteVisualizationFromParent"],
            type: "final",
          },
        },
      },
      {
        actions: {
          deleteVisualizationFromParent: sendParent((context) => ({
            type: "VISUALIZATIONS.REMOVE",
            payload: context.visualization,
          })),
          updateVisualization: assign((_context, event) => {
            return {
              visualization: event.payload as visualization.Visualization,
              onDone: event.onDone,
            };
          }),
          updateTitle: assign((context, event) => {
            const myWorkItem = actorSystem.get<WorkItemActorRef>(`workItem-visualization-${context.visualization.id}`);
            if (myWorkItem) {
              myWorkItem.send({
                type: "WORK_ITEM.SET_NAME",
                payload: event.payload.title,
                workItemId: context.visualization.id,
                entityType: "visualization",
              });
            }
            return {
              visualization: {
                ...context.visualization,
                title: event.payload.title,
              },
            };
          }),
          removeWorkItem: (context) => {
            const workItems = actorSystem.get<WorkItemsActorRef>(`workItems`);
            if (workItems) {
              workItems.send({
                type: "WORK_ITEMS.REMOVE",
                payload: { id: context.visualization.id, typename: "visualization" },
              });
            }
          },
          trackingDelete: (context) => {
            tracking("delete_visualization", "Query Editor", {
              query_id: context.visualization.queryId!,
              visualization_id: context.visualization.id,
            });
          },
        },
        services: {
          delete: async (context, event) => {
            await deleteVisualization(context.visualization.id);
            event.onDone?.();
          },
          update: async (context) => {
            const vis = await updateVisualization(context.visualization.id, context.visualization);
            context.onDone?.(vis);
            return vis;
          },
        },
      }
    );
  return visualizationMachine;
};

export const useVisualization = (id: string) => {
  const [state, ref] = useActorFromSystem<VisualizationActorRef>(`visualization-${id}`);
  if (!state) return undefined;
  return {
    value: state.context.visualization,
    update: (v: visualization.VisualizationUpdate) => ref.send({ type: "VISUALIZATION.UPDATE", payload: v }),
    updateTitle: (title: string) => ref.send({ type: "VISUALIZATION.UPDATE_TITLE", payload: { title } }),
    delete: (onDone?: () => void) => ref.send({ type: "VISUALIZATION.DELETE", onDone }),
    isSaving: state.matches("saving"),
  };
};
