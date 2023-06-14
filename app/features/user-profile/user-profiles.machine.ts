import { ActorRefFrom, assign, createMachine, spawn, StateFrom, toActorRef } from "xstate";
import { actorSystem } from "~/state/system";
import { createUserProfileMachine, CreateUserProfileMachineProps, UserProfileActorRef } from "./user-profile.machine";
import { useSelector } from "@xstate/react";

export const createUserProfilesMachine = () => {
  const userProfilesMachine = createMachine(
    {
      id: "user-profiles",
      predictableActionArguments: true,
      tsTypes: {} as import("./user-profiles.machine.typegen").Typegen0,
      schema: {
        context: {} as UserProfilesContext,
        events: {} as UserProfilesEvent,
      },
      context: {
        userProfiles: [],
        init: false,
      },
      on: {
        "USER_PROFILES.ADD_PROFILE": {
          actions: ["addUserProfile"],
        },
      },
      initial: "idle",
      states: {
        idle: {},
      },
    },
    {
      actions: {
        addUserProfile: assign((ctx, event) => {
          const { user } = event.payload;
          const existing = ctx.userProfiles.find((q) => q.getSnapshot()!.context.user.id === user.id);
          if (existing) {
            return {};
          }
          const userProfileRef = spawn(createUserProfileMachine(event.payload), {
            sync: true,
            name: `user-profile-${user.id}`,
          });
          actorSystem.register(userProfileRef, `user-profile-${user.id}`);
          return {
            init: true,
            userProfiles: [...ctx.userProfiles, userProfileRef],
          };
        }),
      },
    }
  );

  return userProfilesMachine;
};

interface UserProfilesContext {
  userProfiles: UserProfileActorRef[];
  init: boolean;
}

type UserProfilesEvent = { type: "USER_PROFILES.ADD_PROFILE"; payload: CreateUserProfileMachineProps };

export type UserProfilesActorRef = ActorRefFrom<ReturnType<typeof createUserProfilesMachine>>;
export type UserProfilesState = StateFrom<ReturnType<typeof createUserProfilesMachine>>;

export const useUserProfiles = () => {
  const ref = actorSystem.get<UserProfilesActorRef>("userProfiles") ?? toActorRef({ send: () => {} });
  const users = useSelector(ref, usersSelector);
  return {
    users,
    addUserProfile: (payload: CreateUserProfileMachineProps) =>
      ref.send({ type: "USER_PROFILES.ADD_PROFILE", payload }),
  };
};

const usersSelector = (state: UserProfilesState) =>
  state.context.userProfiles.map((q) => q.getSnapshot()!.context?.user);
