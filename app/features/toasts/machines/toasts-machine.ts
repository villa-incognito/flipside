import { assign, createMachine, spawn, ActorRefFrom } from "xstate";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { Notification } from "../toast-root";

export const createToasterMachine = () => {
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2BDWywCcB06AxsgJYBuYAxAHIDyAKgJIBiAmgNoAMAuoqAA6pYJUqgB2fEAA9EARgDMAVjwAOWSsUBOFZsWcAbIvm6ANCACeiefIAseAOyb9nXfZs3Fs-boC+Ps2iY2PhEpBSUACKMAMoAsjHRXLxIIILCohIpMgiy9rJ4ijYATEW2xUW5hSpmlggAtPryeNb6uSpFNrkd8ip+-iBiqBBwkoFYuJJpIiTiktl1NtUWiHWyeqoVGt6aRUadfgEY4yHE5GCTQtOzWYicNXLufT5AA */
  return createMachine(
    {
      id: "toaster",
      initial: "active",
      tsTypes: {} as import("./toasts-machine.typegen").Typegen0,
      schema: {
        context: {} as ToasterMachineContext,
        events: {} as ToasterMachineEvent | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: () => globalEvents$$,
      },
      context: {
        toasts: [],
      },
      states: {
        active: {
          on: {
            NOTIFY: {
              actions: ["createToast"],
            },
            "TOAST.NOTIFY": {
              actions: ["createToast"],
            },
          },
        },
      },
    },
    {
      actions: {
        createToast: assign({
          toasts: (ctx, event) => {
            return [...ctx.toasts, spawn(createToastMachine(event.notif))];
          },
        }),
      },
    }
  );
};

const createToastMachine = (notif: Notification) => {
  return createMachine({
    id: "toast",
    initial: "active",
    schema: {
      context: {} as Notification,
    },
    context: notif,
    states: {
      active: {
        on: {
          DISMISS: { target: "inactive" },
        },
      },
      inactive: { type: "final" },
    },
  });
};

interface ToasterMachineContext {
  toasts: ToastActorRef[];
}

export type ToastActorRef = ActorRefFrom<ReturnType<typeof createToastMachine>>;

type ToasterMachineEvent = {
  type: "NOTIFY";
  notif: Notification;
};

export type ToasterGlobalEvent = {
  type: "TOAST.NOTIFY";
  notif: Notification;
};
