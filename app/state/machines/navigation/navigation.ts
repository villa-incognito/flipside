import { useNavigate } from "@remix-run/react";
import { ActorRefFrom, createMachine } from "xstate";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { $path } from "remix-routes";

export type Navigator = ReturnType<typeof useNavigate>;
export const createNavigationMachine = (nav: Navigator) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: "navigation",
      tsTypes: {} as import("./navigation.typegen").Typegen0,
      schema: {
        context: {} as NavigationContext,
        events: {} as NavigationEvent | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      context: {
        navigator: nav,
      },
      on: {
        "NAVIGATE.NAVIGATE_TO": {
          actions: ["navigateTo"],
        },
        "WORK_ITEMS.REMOVE": {
          description: "if the item is a visualization, navigate to its parent query",
          actions: ["maybeNavigateOnRemove"],
        },
      },
      initial: "idle",
      states: {
        idle: {},
      },
    },
    {
      actions: {
        navigateTo: (context, event) => {
          context.navigator(event.payload);
        },
        maybeNavigateOnRemove: (context, event) => {
          if (event.payload.typename === "visualization") {
            context.navigator($path("/edit/queries/:id", { id: event.payload.parentId! }));
          }
        },
      },
      services: {
        globalEvents: () => globalEvents$$,
      },
    }
  );

type NavigationEvent = { type: "NAVIGATE.NAVIGATE_TO"; payload: string };
export type NavigationActorRef = ActorRefFrom<ReturnType<typeof createNavigationMachine>>;

interface NavigationContext {
  navigator: ReturnType<typeof useNavigate>;
}
