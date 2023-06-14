import { ActorRefFrom, assign, createMachine } from "xstate";
import { useSelector } from "@xstate/react";
import { UserState } from "@fscrypto/domain/src/user-state";
import { actorSystem } from "~/state/system";
import { GlobalEvent, globalEvents$$ } from "~/state/events";
import { updateUserState } from "~/async/update-user-state";
import { useUserProfile } from "~/features/app-shell/components/side-panel/user-profile";

export const createUserStateMachine = (userState: UserState) => {
  return createMachine(
    {
      id: "user-state",
      tsTypes: {} as import("./user-state.typegen").Typegen0,
      predictableActionArguments: true,
      schema: {
        context: {} as UserStateMachineContext,
        events: {} as UserStateInputEvents,
      },
      invoke: {
        id: "global-events",
        src: () => globalEvents$$,
      },
      on: {
        "USER_STATE.UPDATE_THEME": {
          actions: ["broadcastSetTheme", "setTheme"],
          target: "debouncing",
        },
        "GLOBAL.SET_ACTIVE_QUERY": {
          actions: "setActiveQuery",
        },
      },
      initial: "idle",
      states: {
        idle: {},
        debouncing: {
          after: {
            500: [{ target: "saving", cond: "isUser" }, { target: "idle" }],
          },
        },
        saving: {
          invoke: {
            id: "save-user-state",
            src: "saveUserState",
            onDone: "idle",
          },
        },
      },
      context: {
        theme: userState?.theme ?? "light",
        activeQueryId: null,
      },
    },
    {
      actions: {
        setTheme: assign((context, event) => {
          return {
            theme: event.payload.theme,
          };
        }),
        broadcastSetTheme: (context, event) => {
          globalEvents$$.next({
            type: "USER_STATE.UPDATED_THEME",
            payload: { theme: event.payload.theme },
          });
        },
        setActiveQuery: assign((_, event) => {
          return {
            activeQueryId: event.payload,
          };
        }),
      },
      services: {
        saveUserState: (context) => updateUserState({ theme: context.theme }),
      },
      guards: {
        isUser: () => !!userState,
      },
    }
  );
};

interface UserStateMachineContext {
  theme: "light" | "dark";
  activeQueryId: string | null;
}

type UserStateInputEvents =
  | {
      type: "USER_STATE.UPDATE_THEME";
      payload: {
        theme: "light" | "dark";
        queryId: string | null;
        user: boolean;
      };
    }
  | GlobalEvent;

export type UserStateOutputEvents = {
  type: "USER_STATE.UPDATED_THEME";
  payload: {
    theme: "light" | "dark";
  };
};

export type UserStateRef = ActorRefFrom<ReturnType<typeof createUserStateMachine>>;

export const useUserStateMachine = () => {
  const service = actorSystem?.get("userState")!;
  const theme = useSelector(service, (state) => state.context.theme);
  const queryId = useSelector(service, (state) => state.context.activeQueryId);
  const { currentUser } = useUserProfile();
  return {
    theme,
    setTheme: (theme: "light" | "dark") =>
      service.send({ type: "USER_STATE.UPDATE_THEME", payload: { theme, queryId, user: !!currentUser } }),
  };
};
