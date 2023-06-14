import { ActorRefFrom, StateFrom, assign, createMachine, spawn } from "xstate";
import type { searchDashboard, tag, user } from "@fscrypto/domain";
import {
  DashboardsMachineParams,
  DiscoverDashboardsActorRef,
  createDiscoverDashboardsMachine,
} from "~/state/machines/discover/discover-dashboards";
import { useActorFromSystem } from "~/state/hooks";

export interface CreateUserProfileMachineProps {
  user: user.User;
  dashboards: searchDashboard.SearchDashboard[];
  params: DashboardsMachineParams;
  projects: tag.Tag[];
  totalResults: number;
  dashboardLikeCount: number;
}

export const createUserProfileMachine = ({
  user,
  dashboards,
  params,
  projects,
  totalResults,
  dashboardLikeCount,
}: CreateUserProfileMachineProps) => {
  return createMachine(
    {
      id: "user-profile",
      tsTypes: {} as import("./user-profile.machine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "initial",
      schema: {
        context: {} as UserProfileMachineContext,
        events: {} as UserProfileMachineEvent,
      },
      context: {
        user,
        dashboardLikeCount,
      },
      states: {
        initial: {
          always: [
            {
              target: "ready",
              actions: ["createData"],
            },
          ],
        },
        ready: {},
      },
    },
    {
      actions: {
        createData: assign((_) => {
          return createInitialContext(user, dashboards, params, projects, totalResults, dashboardLikeCount);
        }),
      },
    }
  );
};

interface UserProfileMachineContext {
  user: user.User;
  dashboardLikeCount: number;
  dashboardRef?: DiscoverDashboardsActorRef;
}

export type UserProfileActorRef = ActorRefFrom<ReturnType<typeof createUserProfileMachine>>;
export type UserProfileState = StateFrom<ReturnType<typeof createUserProfileMachine>>;

type UserProfileMachineEvent =
  | {
      type: "LOAD_MORE";
    }
  | {
      type: "NEW_USER";
      user: user.User;
      dashboards: searchDashboard.SearchDashboard[];
      params: DashboardsMachineParams;
      totalResults: number;
    };

const createInitialContext = (
  user: user.User,
  dashboards: searchDashboard.SearchDashboard[],
  params: DashboardsMachineParams,
  projects: tag.Tag[],
  totalResults: number,
  dashboardLikeCount: number
) => {
  return {
    user,
    dashboardLikeCount,
    dashboardRef: spawn(
      createDiscoverDashboardsMachine({
        dashboards,
        params,
        userId: user.id,
        projects,
        totalResults,
        initializeWithData: true,
      })
    ),
  };
};

export const useUserProfile = (id: string) => {
  const [state, ref] = useActorFromSystem<UserProfileActorRef>(`user-profile-${id}`);

  if (!state) return undefined;

  return {
    dashboardsRef: ref?.getSnapshot()?.context.dashboardRef!,
  };
};
