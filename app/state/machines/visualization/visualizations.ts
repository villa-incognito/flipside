import { visualization } from "@fscrypto/domain";
import { useActor } from "@xstate/react";
import { uniqBy, groupBy, mapValues } from "lodash";
import { ActorRefFrom, assign, createMachine, spawn, raise } from "xstate";
import { actorSystem } from "../..";
import { tracking } from "~/utils/tracking";
import { CollectionEvent, UseCollection } from "../../types";
import { createVisualizationMachine, VisualizationActorRef } from "./visualization";
import { createVisualization } from "./requests";
import { WorkItem } from "@fscrypto/domain/src/work-item";
import { WorkItemsActorRef } from "../work-items/work-items";

export type VisualizationsActorRef = ActorRefFrom<ReturnType<typeof createVisualizationsMachine>>;
interface VisualizationsContext {
  visualizations: VisualizationActorRef[];
  onDone?: (v: visualization.Visualization) => void;
}
type VisualizationsEvent =
  | CollectionEvent<"visualization", visualization.Visualization, visualization.VisualizationNew>
  | { type: "done.invoke.createVisualization"; data: visualization.Visualization };

export const createVisualizationsMachine = () => {
  const visualizationsMachine = createMachine(
    {
      predictableActionArguments: true,
      id: "visualizations",
      tsTypes: {} as import("./visualizations.typegen").Typegen0,
      schema: {
        context: {} as VisualizationsContext,
        events: {} as VisualizationsEvent,
      },
      context: {
        visualizations: [],
      },
      on: {
        "VISUALIZATIONS.ADD": {
          actions: ["addVisualization"],
        },
        "VISUALIZATIONS.REMOVE": {
          actions: ["removeVisualization"],
        },
        "VISUALIZATIONS.ADD_MANY": {
          actions: ["addManyVisualizations"],
        },
      },
      initial: "idle",
      states: {
        idle: {
          on: {
            "VISUALIZATIONS.CREATE": {
              target: "creating",
            },
          },
        },
        creating: {
          entry: ["addOnDoneHandler"],
          invoke: {
            id: "createVisualization",
            src: "createVisualization",
            onDone: {
              actions: ["addCreatedVisualization", "trackingCreateVisualization", "addWorkItem"],
              target: "created",
            },
            onError: {
              actions: [(_, e) => console.log(e)],
            },
          },
        },
        created: {
          entry: ["callOnDoneHandler", "removeOnDoneHandler"],
          always: "idle",
        },
      },
    },
    {
      actions: {
        addVisualization: assign((context, event) => {
          const id = event.payload.id;
          const exists = context.visualizations.find((vis) => vis.id === id);
          if (exists) return {};
          const visRef = spawn(createVisualizationMachine(event.payload), { name: event.payload.id, sync: true });
          actorSystem.register(visRef, `visualization-${event.payload.id}`);
          return {
            visualizations: [...context.visualizations, visRef],
          };
        }),
        removeVisualization: assign({
          visualizations: (context, event) => {
            actorSystem.unregister(`visualization-${event.payload.id}`);
            return context.visualizations.filter((vis) => vis.id !== event.payload.id);
          },
        }),
        addWorkItem: (context, event) => {
          const workItems = actorSystem.get<WorkItemsActorRef>(`workItems`);
          if (workItems) {
            workItems.send({
              type: "WORK_ITEMS.ADD",
              payload: {
                id: event.data.id,
                typename: "visualization",
                name: event.data.title,
                parentId: event.data.queryId ?? null,
                createdAt: event.data.createdAt,
                updatedAt: event.data.updatedAt,
              } as WorkItem,
            });
          }
        },
        addManyVisualizations: assign((context, event) => {
          const visRefs = event.payload.map((vis) => {
            const ref = spawn(createVisualizationMachine(vis), { name: vis.id });
            actorSystem.register(ref, `visualization-${vis.id}`);
            return ref;
          });
          return {
            visualizations: uniqBy([...context.visualizations, ...visRefs], "id"),
          };
        }),
        trackingCreateVisualization: (_, e) => {
          tracking("create_new_chart", "Query Editor", { query_id: e.data.queryId! });
        },
        //@ts-ignore
        addCreatedVisualization: raise((_, e) => {
          return { type: "VISUALIZATIONS.ADD", payload: e.data };
        }),
        callOnDoneHandler: (context, e) => {
          context.onDone?.(e.data);
        },
        addOnDoneHandler: assign({
          onDone: (_, e) => e.onDone,
        }),
        removeOnDoneHandler: assign({
          onDone: (_, __) => undefined,
        }),
      },
      services: {
        createVisualization: async (_, event) => {
          const vis = await createVisualization(event.payload);
          return vis;
        },
      },
    }
  );
  return visualizationsMachine;
};

interface UseVisualizations extends UseCollection<visualization.Visualization, visualization.VisualizationNew> {
  byQueryId: Record<string, string[]>;
  isCreating: boolean;
}
export const useVisualizations = (): UseVisualizations => {
  const visualizationsRef = actorSystem.get<VisualizationsActorRef>("visualizations")!;
  const [machine, send] = useActor(visualizationsRef);
  const visualizations = machine.context.visualizations;
  return {
    get byQueryId() {
      const grouped = groupBy(visualizations, (vis) => vis.getSnapshot()?.context.visualization.queryId!);
      return mapValues(grouped, (vis) => vis.map((v) => v.getSnapshot()!.context.visualization.id));
    },
    ids: visualizations.map((vis) => vis.getSnapshot()!.context.visualization.id),
    isCreating: machine.matches("creating"),
    create: (newVis: visualization.VisualizationNew, onDone?: (d: visualization.Visualization) => void) =>
      send({ type: "VISUALIZATIONS.CREATE", payload: newVis, onDone }),
    add: (vis: visualization.Visualization) => send({ type: "VISUALIZATIONS.ADD", payload: vis }),
    addMany: (vis: visualization.Visualization[]) => send({ type: "VISUALIZATIONS.ADD_MANY", payload: vis }),
  };
};
