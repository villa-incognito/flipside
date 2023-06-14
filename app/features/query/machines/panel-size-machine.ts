import { ActorRefFrom, assign, createMachine, sendParent } from "xstate";
import { query } from "@fscrypto/domain";
import { animate } from "framer-motion";
import { actorSystem } from "~/state";
import { useActor } from "@xstate/react";
import { QueryActorRef } from "~/state/machines";

interface CreatePanelSizeProps {
  queryId: string;
  ratios: query.QueryMeta["panel"];
}

export const createPanelSizeMachine = ({ ratios = defaultSize }: CreatePanelSizeProps) => {
  const panelSizeMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QAcCGA7MAbAygSwC8wBiAQQDkBJAWVIBUBRAfQAUKGAZJgJXsoHkA2gAYAuohQB7WHgAueSegkgAHogC0ARgDMANgB0mgKy6ATEYA0IAJ6JTADgOaA7AE5d950YC+3q2kxcQjB9DDwAW1R5RVD0CKi8dCgyKlo6AXImAGF+ahYOBkYRcSQQZGk5BSVStQQAFjrTQ09LG0Q6vX1hZ2FtTXNffwxsfCJ9SEqk4hxC1nYuXnShMWVymWjq0Frze0NXV1NNFqtbBE0O-QdXYTMfPzLhoLGJ+ST9WFQAN0TkiEUQxKfSQAaxCH0+YBYj1GcGKqwqG2UtU0NwM9iMRjqHi8J0Qml0zn0RmMt0GD0CMPGEEmUH0EDAACNJABXdAAYx+xBUsFkURCqAAZrIwAAnAAURmEwgAlMQAiNglSaXTGSz2T84aU1pVFEjEEZ3Po6sJTNoOji2mcCUSSQMyehJPT4FrocF4esqnqEFp7HVDCZzLjvX19K5fdovGT5U9+XFIoitQjPTU7AYHP1WqdtOYiT0+nahhTFWF41V9HgIFgwO6dZtVIgPMJ9M5dAHM+1OkY8xmo66xiWEjEB68oDWE1tEM4-enA5a6jout2C+SFc9qSOx8mJwhDk3NPtDsdLRibW3e0W18qK1XN7qU2dTM5NPps40jhbTviDMSz-do5SXh+d4vh+W861qZxsyNbRtANCN2zOC5hFtO5C1XEJALeekmVZDkkjAr06hMQxhExbEEK-U9SV8bwgA */
    createMachine(
      {
        id: "panelSize",
        type: "parallel",
        tsTypes: {} as import("./panel-size-machine.typegen").Typegen0,
        schema: {
          context: {} as PanelSizeContext,
          events: {} as PanelSizeEvent,
        },
        context: {
          verticalRatio: ratios.verticalRatio,
          horizontalRatio: ratios.horizontalRatio,
        },
        states: {
          animation: {
            initial: "idle",
            states: {
              idle: {},
              animateTopLeft: {
                invoke: {
                  id: "animateTopLeft",
                  src: "animateTopLeft",
                },
                on: {
                  ANIMATION_COMPLETE: {
                    target: "idle",
                  },
                },
              },
              maxMinTopLeft: {
                invoke: {
                  id: "maxMinTopLeft",
                  src: "maxMinTopLeft",
                },
                on: {
                  ANIMATION_COMPLETE: {
                    target: "idle",
                  },
                },
              },
              animateTopRight: {
                invoke: {
                  id: "animateTopRight",
                  src: "animateTopRight",
                },
                on: {
                  ANIMATION_COMPLETE: {
                    target: "idle",
                  },
                },
              },
              maxMinTopRight: {
                invoke: {
                  id: "maxMinTopRight",
                  src: "maxMinTopRight",
                },
                on: {
                  ANIMATION_COMPLETE: {
                    target: "idle",
                  },
                },
              },
              animateBottom: {
                invoke: {
                  id: "animateBottom",
                  src: "animateBottom",
                },
                on: {
                  ANIMATION_COMPLETE: {
                    target: "idle",
                  },
                },
              },
              maxMinBottom: {
                invoke: {
                  id: "maxMinBottom",
                  src: "maxMinBottom",
                },
                on: {
                  ANIMATION_COMPLETE: {
                    target: "idle",
                  },
                },
              },
              animating: {
                invoke: {
                  id: "panelSizeAnimator",
                  src: "animatePanelSize",
                },
                on: {
                  ANIMATION_COMPLETE: {
                    target: "idle",
                  },
                },
              },
            },
            on: {
              ANIMATE_PANEL_RATIO: {
                target: ".animating",
              },
              ANIMATE_TOP_LEFT: {
                target: ".animateTopLeft",
              },
              MAX_MIN_TOP_LEFT: {
                target: ".maxMinTopLeft",
              },
              ANIMATE_TOP_RIGHT: {
                target: ".animateTopRight",
              },
              MAX_MIN_TOP_RIGHT: {
                target: ".maxMinTopRight",
              },
              ANIMATE_BOTTOM: {
                target: ".animateBottom",
              },
              MAX_MIN_BOTTOM: {
                target: ".maxMinBottom",
              },
            },
          },
          editing: {
            initial: "idle",
            states: {
              idle: {
                on: {
                  SET_PANEL_RATIO: {
                    target: "debouncing",
                    actions: ["setPanelRatio"],
                  },
                },
              },
              debouncing: {
                on: {
                  SET_PANEL_RATIO: {
                    target: "debouncing",
                    actions: ["setPanelRatio"],
                  },
                },
                after: {
                  500: {
                    target: "idle",
                    actions: ["updateQuery"],
                  },
                },
              },
            },
          },
        },
        on: {
          ANIMATE_PANEL_RATIO: {
            target: "animation.animating",
          },
        },
      },
      {
        actions: {
          setPanelRatio: assign((context, event) => {
            if (event.direction === "horizontal") {
              return {
                horizontalRatio: event.ratio,
              };
            }
            return {
              verticalRatio: event.ratio,
            };
          }),
          updateQuery: sendParent((context) => {
            return {
              type: "QUERY.UPDATE_REQUEST",
              payload: {
                meta: {
                  panel: { ...context },
                },
              },
            };
          }),
        },
        services: {
          animateTopLeft: (context) => (send) => {
            const currentTopLeft = context.horizontalRatio[0];
            const target = currentTopLeft === 0 ? 50 : currentTopLeft > 60 ? 50 : 0;
            animate(context.horizontalRatio[0], target, {
              duration: 0.3,
              ease: "easeInOut",
              onUpdate(value: number) {
                const max = 100;
                const diff = max - value;
                send({ type: "SET_PANEL_RATIO", ratio: [value, diff], direction: "horizontal" });
              },
              onComplete() {
                send({ type: "ANIMATION_COMPLETE" });
              },
            });
          },
          maxMinTopLeft: (context) => (send) => {
            const currentTopLeftHorizontal = context.horizontalRatio[0];
            const currentTopLeftVertical = context.verticalRatio[0];
            const horizontalTarget = currentTopLeftHorizontal < 100 ? 100 : 50;
            const verticalTarget = currentTopLeftHorizontal < 100 ? 100 : 40;
            animate(currentTopLeftHorizontal, horizontalTarget, {
              duration: 0.3,
              ease: "easeInOut",
              onUpdate(value: number) {
                const max = 100;
                const diff = max - value;
                send({ type: "SET_PANEL_RATIO", ratio: [value, diff], direction: "horizontal" });
              },
              onComplete() {
                send({ type: "ANIMATION_COMPLETE" });
              },
            });
            animate(currentTopLeftVertical, verticalTarget, {
              duration: 0.3,
              ease: "easeInOut",
              onUpdate(value: number) {
                const max = 100;
                const diff = max - value;
                send({ type: "SET_PANEL_RATIO", ratio: [value, diff], direction: "vertical" });
              },
              onComplete() {
                send({ type: "ANIMATION_COMPLETE" });
              },
            });
          },
          animateTopRight: (context, event) => (send) => {
            let target = event.target;
            const currentTopLeft = context.horizontalRatio[1];
            if (!target) {
              target = currentTopLeft === 0 ? 50 : currentTopLeft > 60 ? 50 : 0;
            }
            animate(context.horizontalRatio[1], target, {
              duration: 0.3,
              ease: "easeInOut",
              onUpdate(value: number) {
                const max = 100;
                const diff = max - value;
                send({ type: "SET_PANEL_RATIO", ratio: [diff, value], direction: "horizontal" });
              },
              onComplete() {
                send({ type: "ANIMATION_COMPLETE" });
              },
            });
          },
          maxMinTopRight: (context) => (send) => {
            const currentTopRightHorizontal = context.horizontalRatio[1];
            const currentTopRightVertical = context.verticalRatio[0];
            const horizontalTarget = currentTopRightHorizontal < 100 ? 100 : 50;
            const verticalTarget = currentTopRightHorizontal < 100 ? 100 : 40;
            animate(currentTopRightHorizontal, horizontalTarget, {
              duration: 0.3,
              ease: "easeInOut",
              onUpdate(value: number) {
                const max = 100;
                const diff = max - value;
                send({ type: "SET_PANEL_RATIO", ratio: [diff, value], direction: "horizontal" });
              },
              onComplete() {
                send({ type: "ANIMATION_COMPLETE" });
              },
            });
            animate(currentTopRightVertical, verticalTarget, {
              duration: 0.3,
              ease: "easeInOut",
              onUpdate(value: number) {
                const max = 100;
                const diff = max - value;
                send({ type: "SET_PANEL_RATIO", ratio: [value, diff], direction: "vertical" });
              },
              onComplete() {
                send({ type: "ANIMATION_COMPLETE" });
              },
            });
          },
          animateBottom: (context, event) => (send) => {
            let target = event.target;
            const currentBottom = context.verticalRatio[1];
            if (!target) {
              target = currentBottom === 0 ? 50 : currentBottom > 60 ? 50 : 0;
            }
            animate(context.verticalRatio[1], target, {
              duration: 0.3,
              ease: "easeInOut",
              onUpdate(value: number) {
                const max = 100;
                const diff = max - value;
                send({ type: "SET_PANEL_RATIO", ratio: [diff, value], direction: "vertical" });
              },
              onComplete() {
                send({ type: "ANIMATION_COMPLETE" });
              },
            });
          },
          maxMinBottom: (context) => (send) => {
            const currentBottom = context.verticalRatio[1];
            const target = currentBottom < 100 ? 100 : 60;
            animate(context.verticalRatio[1], target, {
              duration: 0.3,
              ease: "easeInOut",
              onUpdate(value: number) {
                const max = 100;
                const diff = max - value;
                send({ type: "SET_PANEL_RATIO", ratio: [diff, value], direction: "vertical" });
              },
              onComplete() {
                send({ type: "ANIMATION_COMPLETE" });
              },
            });
          },
          animatePanelSize: (context, event) => (send) => {
            animate(context.verticalRatio[0], event.target, {
              duration: 0.3,
              ease: "easeInOut",
              onUpdate(value: number) {
                const max = 100;
                const diff = max - value;
                send({ type: "SET_PANEL_RATIO", ratio: [value, diff], direction: event.direction });
              },
              onComplete() {
                send({ type: "ANIMATION_COMPLETE" });
              },
            });
          },
        },
      }
    );
  return panelSizeMachine;
};

interface PanelSizeContext {
  verticalRatio: [number, number];
  horizontalRatio: [number, number];
}

export type PanelSizeRef = ActorRefFrom<ReturnType<typeof createPanelSizeMachine>>;

type PanelSizeEvent =
  | {
      type: "done.invoke.fetchPanelSize";
    }
  | {
      type: "ANIMATE_PANEL_RATIO";
      target: number;
      direction: "vertical" | "horizontal";
    }
  | {
      type: "ANIMATION_COMPLETE";
    }
  | {
      type: "SET_PANEL_RATIO";
      ratio: [number, number];
      direction: "vertical" | "horizontal";
    }
  | {
      type: "ANIMATE_TOP_LEFT";
      target?: number;
    }
  | {
      type: "ANIMATE_TOP_RIGHT";
      target?: number;
    }
  | {
      type: "MAX_MIN_TOP_RIGHT";
      target?: number;
    }
  | {
      type: "ANIMATE_BOTTOM";
      target?: number;
    }
  | {
      type: "MAX_MIN_BOTTOM";
    }
  | {
      type: "MAX_MIN_TOP_LEFT";
    };

const defaultSize: PanelSizeContext = {
  verticalRatio: [100, 0],
  horizontalRatio: [100, 0],
};

export const usePanelSizeMachine = ({ queryId }: { queryId: string }) => {
  const queryRef = actorSystem.get<QueryActorRef>(`query-${queryId}`);
  const panelSizeRef = queryRef?.getSnapshot()?.context.panelSizeRef;
  const [state, send] = useActor(panelSizeRef!);
  const isAnimatingBottom = state.matches("animation.animateBottom");
  return {
    isAnimatingBottom,
    setPanelRatio: (ratio: [number, number], direction: "vertical" | "horizontal") =>
      send({ type: "SET_PANEL_RATIO", ratio, direction }),
    animateTopLeft: () => send({ type: "ANIMATE_TOP_LEFT" }),
    animateTopRight: () => send({ type: "ANIMATE_TOP_RIGHT" }),
    animateBottom: () => send({ type: "ANIMATE_BOTTOM" }),
    animateMaxMinTopLeft: () => send({ type: "MAX_MIN_TOP_LEFT" }),
    animateMaxMinTopRight: () => send({ type: "MAX_MIN_TOP_RIGHT" }),
    animateMaxMinBottom: () => send({ type: "MAX_MIN_BOTTOM" }),
    horizontalRatio: state.context.horizontalRatio,
    verticalRatio: state.context.verticalRatio,
    growBottomIfClosed: () => {
      if (state.context.verticalRatio[1] < 30) {
        send({ type: "ANIMATE_BOTTOM", target: 50 });
      }
    },
    growRightIfClosed: () => {
      if (state.context.horizontalRatio[1] < 10) {
        send({ type: "ANIMATE_TOP_RIGHT", target: 50 });
      }
    },
  };
};
