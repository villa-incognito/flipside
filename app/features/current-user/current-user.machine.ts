import type { ActorRefFrom, StateFrom } from "xstate";
import { createMachine } from "xstate";
import { assign } from "xstate";
import type { CurrentUser } from "~/utils/auth.server";
import { user as userDomain } from "@fscrypto/domain";
import { actorSystem } from "~/state";
import { useSelector } from "@xstate/react";
import { globalEvents$$ } from "~/state/events";

export const createCurrentUserMachine = (currentUser?: CurrentUser) => {
  return createMachine(
    {
      id: "currentUser",
      tsTypes: {} as import("./current-user.machine.typegen").Typegen0,
      type: "parallel",
      schema: {
        context: {} as CurrentUserContext,
        events: {} as CurrentUserEvents,
      },
      context: {
        currentUser,
        errors: null,
        // toast: null,
      },
      initial: "initialState",
      states: {
        initialState: {},
        editProfile: {
          initial: "idle",
          states: {
            idle: {},
            validating: {
              initial: "init",
              states: {
                init: {
                  always: [
                    {
                      target: "complete",
                      actions: "validateData",
                    },
                  ],
                },
                complete: {
                  always: [
                    {
                      target: "#valid",
                      cond: "isValid",
                    },
                    {
                      target: "#error",
                    },
                  ],
                },
              },
            },
            valid: {
              id: "valid",
            },
            error: {
              id: "error",
            },
            submitError: {},
            submitting: {
              invoke: {
                id: "submitUser",
                src: "submitUser",
                onDone: {
                  target: "#valid",
                },
                onError: {
                  target: "idle",
                  actions: ["toast"],
                },
              },
            },
          },
          on: {
            "CURRENT_USER.SET_USER_DATA": {
              actions: "updateUser",
              target: ".validating.init",
            },
            "CURRENT_USER.UPDATE_REQUEST": {
              target: ".submitting",
            },
          },
        },
      },
    },
    {
      actions: {
        updateUser: assign((context, event) => {
          if (!context.currentUser) return context;
          return {
            currentUser: { ...context.currentUser, ...event.payload },
          };
        }),
        validateData: assign((context) => {
          const validatedValue = userDomain.updateSchema.safeParse({
            ...context.currentUser,
          });
          if (validatedValue.success) {
            return {
              errors: null,
            };
          } else {
            const errors: Partial<Record<keyof CurrentUser, string>> = {};
            validatedValue.error.issues.forEach((issue) => {
              const issuePath = issue.path[0] as keyof CurrentUser;
              errors[issuePath] = issue.message;
            });
            return { errors };
          }
        }),
        toast: (_, event) => {
          //TODO: the backend is redirecting for some reason, create an observable instead of a promise to handle that (or fix the backend)
          if (event.data.toastDesc) {
            globalEvents$$.next({
              type: "TOAST.NOTIFY",
              notif: { title: "Error Updating User", type: "error", description: event.data.toastDesc },
            });
          }
          globalEvents$$.next({
            type: "TOAST.NOTIFY",
            notif: { title: "Success!", type: "success", description: "Your profile has been updated." },
          });
        },
      },
      services: {
        submitUser: async (ctx) => {
          if (!ctx.currentUser) return;
          const url = `${window.location.protocol}//${window.location.host}/api/users/${ctx.currentUser.id}/update`;
          const formData = new FormData();
          formData.append("username", ctx.currentUser.username);
          formData.append("email", ctx.currentUser.email);
          formData.append("twitterHandle", ctx.currentUser.twitterHandle || "");
          formData.append("discordHandle", ctx.currentUser.discordHandle || "");
          formData.append("telegramHandle", ctx.currentUser.telegramHandle || "");
          ctx.currentUser.backgroundImageId && formData.append("backgroundImageId", ctx.currentUser.backgroundImageId);
          ctx.currentUser.avatarId && formData.append("avatarId", ctx.currentUser.avatarId);

          const response = await fetch(url, { method: "post", body: formData });
          if (response.ok) return await response.json();
          throw await response.json();
        },
      },
      guards: {
        isValid: (context) => {
          return !context.errors;
        },
      },
    }
  );
};

type CurrentUserContext = {
  currentUser?: CurrentUser;
  errors: null | Partial<Record<keyof CurrentUser, string>>;
};

type CurrentUserEvents =
  | { type: "CURRENT_USER.SET_USER_DATA"; payload: Partial<CurrentUser> }
  | { type: "CURRENT_USER.UPDATE_REQUEST" }
  | { type: "error.platform.submitUser"; data: { toastDesc: string; toastType: "success" | "error" } };

export type CurrentUserRef = ActorRefFrom<ReturnType<typeof createCurrentUserMachine>>;
export type CurrentUserState = StateFrom<ReturnType<typeof createCurrentUserMachine>>;

export const useCurrentUser = () => {
  const currentUserRef = actorSystem.get<CurrentUserRef>("currentUser");

  return {
    currentUser: useSelector(currentUserRef!, currentUserSelector),
    errors: useSelector(currentUserRef!, errorsSelector),
    isValid: useSelector(currentUserRef!, isValidSelector),
    isSubmitting: useSelector(currentUserRef!, isSubmittingSelector),
    setUserData: (payload: Partial<CurrentUser>) =>
      currentUserRef?.send({ type: "CURRENT_USER.SET_USER_DATA", payload }),
    submitData: () => currentUserRef?.send({ type: "CURRENT_USER.UPDATE_REQUEST" }),
  };
};

const currentUserSelector = (state: CurrentUserState) => state.context.currentUser;
const errorsSelector = (state: CurrentUserState) => state.context.errors;

const isSubmittingSelector = (state: CurrentUserState) => state.matches("editProfile.submitting");
const isValidSelector = (state: CurrentUserState) => state.matches("editProfile.valid");
