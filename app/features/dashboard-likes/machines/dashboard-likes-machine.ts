import { useInterpret, useSelector } from "@xstate/react";
import { StateFrom, assign, createMachine } from "xstate";
import { likeDashboard } from "../async/like-dashboard";
import { unlikeDashboard } from "../async/unlike-dashboard";

export interface InitialDashboardLikesValues {
  initiallyLikedByMe: boolean;
  initialLikeCount: number;
  dashboardId: string;
}

export const createDashboardLikesMachine = ({
  initiallyLikedByMe,
  initialLikeCount,
  dashboardId,
}: InitialDashboardLikesValues) => {
  const machine = createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QBECGsAWAjA9qgThADICWA1mAHQDGGY1ZJAdlAJIBmrTJALiagBsBAT1IUIAYgDaABgC6iUAAccsXiRxNFIAB6IAtAEZDAFgCslMwHYAbFYBMj+zIDMJhwBoQwgyfsnLAA4bQKsATitAmTNjMJMAX3ivNExcAmJyKlp6RhYOLnVBETFIaUMFJBAVNT5NbT0EfWsLQLNomxMXGUNAsJcrLx9GvwCzYNCIqJjDOMTk9Gw8QhLKAUyISmE4CWQAQQBlAAkAIQB5XYAlZAB9IlYAaQBRfcoAFVOAcQ+iR9kK5VU6jqlQa+jCNhkllcNhsfR6hhshnsg0QbkMlhm9is3RcPRMIQSSRAKUW6RWa3EmzglCUYCYEGYUDEjIkEE0VGYADccBRVpkSWlCH9tNUgVoQQZjF1KDJwkiXPZTGZ+mYUQh7ArKHZ7GYbPZwbLgvZAnNiQtBRleRTIJQmDgdgcTucrrcHs83p9vr95CLAbVxaBQWEZIFKC42mZlWZ3JGZMjvJLYZQNWFWlFcYF7DZ+qaBUtLVRrRs7TS6QyWABVJgUllspgcpjc3kAV2r-PN+eFlVF-vqBmVYUoVhcYTiXRcLlhJjCao19i1Dl1+ohkWziSJdogcG0ebJmV9NQ0Ad0kuNFhhMkmSJC4RnCcaVmMlE6iNsVkicYiuY7e952QYjL5NwfBFKI6wHmKfaNPKVhahCV5ZhMd5DE0ZiDn0r42DEiL9FY36pPm5Lgd2fpHlBRgauiZjOFY7hKlY1Gqve+jhoOw6pnR06GGY+GkssmR8pSWzwCRh7AoGko9C4lg0ZxzQ6mq+iQhOfQyOYsIOB0WGEvMBG-oW6xUrApb0oyzIsBBvYStBhjhjJspyQxCn3qElAIrKri9IEJgTIYvEWkRQnUiQEACGAllkdZYKuG5rh+F0tmGJETFDJRbmLtYOqBOGEImkSu78Vahl2hF4kno0MLooqJg+XYphhMaAzMZCISRslUSGK41iTv5hECUWto4CZ5ZQFWNYWaJkFRThyamLVj7To1arBJQgSmC4oT9H0tgdL1+mCTaJYhWFpXHqCWbzqYoStD52ImMYs64ulOqZWMOUhuu8RAA */
      id: "DashboardLike",
      description:
        "This state machine manages the liking and unliking process for a dashboard, keeping track of the like count and the user's liking status.",
      tsTypes: {} as import("./dashboard-likes-machine.typegen").Typegen0,
      schema: {
        context: {} as DashboardLikesContext,
        events: {} as DashboardLikesEvents,
      },
      context: {
        likeCount: initialLikeCount,
      },
      initial: "checkingIfInitiallyLiked",
      states: {
        checkingIfInitiallyLiked: {
          description:
            'This is a transient state that checks if the user initially liked the dashboard. Once that is determined, it transitions to the "liked" state',
          always: [
            {
              cond: "isInitiallyLiked",
              target: "liked.yes",
            },
            {
              target: "liked.no",
            },
          ],
        },
        liked: {
          description:
            "This state represents the user's liking status. This state has two sub-states: 'yes' and 'no', representing whether the dashboard is liked or not. Both sub-states have an initial sub-state called 'idle' to represent the default state of the liking process",
          initial: "no",
          states: {
            yes: {
              initial: "idle",
              states: {
                pendingLiking: {
                  description: "This state represents the async process of liking a dashboard",
                  invoke: {
                    id: "likeDashboard",
                    src: "likeDashboard",
                    onDone: {
                      target: "idle",
                    },
                  },
                },
                idle: {},
              },
              on: {
                "DASHBOARD_LIKES.TOGGLE": {
                  description: "This event is sent when the user clicks the like button, toggling their liking status",
                  target: "no.pendingUnliking",
                  actions: "removeLike",
                },
              },
            },
            no: {
              initial: "idle",
              states: {
                pendingUnliking: {
                  description: "This state represents the async process of unliking a dashboard",
                  invoke: {
                    id: "unlikeDashboard",
                    src: "unlikeDashboard",
                    onDone: {
                      target: "idle",
                    },
                  },
                },
                idle: {},
              },
              on: {
                "DASHBOARD_LIKES.TOGGLE": {
                  description: "This event is sent when the user clicks the like button, toggling their liking status",
                  target: "yes.pendingLiking",
                  actions: "addLike",
                },
              },
            },
          },
        },
      },
    },

    {
      actions: {
        addLike: assign((context) => {
          return {
            likeCount: context.likeCount + 1,
          };
        }),
        removeLike: assign((context) => {
          return {
            likeCount: context.likeCount - 1,
          };
        }),
      },
      services: {
        likeDashboard: () => likeDashboard({ id: dashboardId }),
        unlikeDashboard: () => unlikeDashboard({ id: dashboardId }),
      },
      guards: {
        isInitiallyLiked: () => {
          return initiallyLikedByMe;
        },
      },
    }
  );
  return machine;
};

type DashboardLikesEvents = { type: "DASHBOARD_LIKES.TOGGLE" };
interface DashboardLikesContext {
  likeCount: number;
}
type DashboardLikesState = StateFrom<ReturnType<typeof createDashboardLikesMachine>>;

export const useDashboardLikes = (initialValues: InitialDashboardLikesValues) => {
  const dashboardLikesRef = useInterpret(() => createDashboardLikesMachine(initialValues));
  return {
    likedByMe: useSelector(dashboardLikesRef, isLikedSelector),
    likeCount: useSelector(dashboardLikesRef, likeCountSelector),
    toggleLiked: () => dashboardLikesRef.send("DASHBOARD_LIKES.TOGGLE"),
  };
};

const isLikedSelector = (state: DashboardLikesState) => {
  return state.matches("liked.yes");
};

const likeCountSelector = (state: DashboardLikesState) => {
  return state.context.likeCount;
};
