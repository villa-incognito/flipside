import { useState } from "react";
import { useInterpret } from "@xstate/react";
import { useRunOnce } from "~/hooks/useRunOnce";
import { workItem } from "@fscrypto/domain";
import { createFileExplorerMachine } from "~/features/file-explorer/machines/file-explorer-machine";
import { createQueryRunsMachine } from "./machines/query-run/query-runs";
import { createWorkItemsMachine } from "./machines/work-items/work-items";
import { createVisualizationsMachine } from "./machines";
import { useNavigate } from "@remix-run/react";
import { createNavigationMachine } from "./machines/navigation/navigation";
import { createExplorerTabsMachine } from "~/features/explorer-tabs/machines/explorer-tabs-machine";
import { createQueriesMachine } from "./machines/query/queries";
import { createAutocompleteSchemaMachine } from "./machines/autocomplete-schema/autocomplete-schema";
import { createChartPanelMachine } from "./machines/chart-panel";
import { createRecentlyOpenedMachine } from "./machines/recently-opened/recently-opened-machine";
import { UserState } from "@fscrypto/domain/src/user-state";
import { createUserStateMachine } from "./machines/user-state/user-state";
import {
  createDiscoverDashboardsMachine,
  initialDiscoverDashboardsData,
} from "./machines/discover/discover-dashboards";
import { createDashboardsMachine } from "./machines/dashboard/dashboards";
import { createDatabaseExplorerMachine } from "./machines/database-explorer/database-explorer.machine";
import { featureFlags$$ } from "./feature-flags";
import { createCurrentUserMachine } from "~/features/current-user/current-user.machine";
import { CurrentUser } from "~/utils/auth.server";
import { AnyActorRef } from "xstate";
import { createQuickNodeEndpointsMachine } from "~/features/live-query/quick-node/quick-node-endpoints.machine";
import { createGoogleNodeEndpointsMachine } from "~/features/live-query/google-node/google-node-endpoints.machine";
import { createLiveQueryMachine } from "~/features/live-query/live-query.machine";
import { BehaviorSubject } from "rxjs";
import { createUserProfilesMachine } from "~/features/user-profile/user-profiles.machine";

export type ActorSystemKey =
  | "navigate"
  | "workItems"
  | `workItem-${workItem.WorkItemType}-${string}`
  | "visualizations"
  | `visualization-${string}`
  | "dashboards"
  | `dashboard-${string}`
  | "queries"
  | `query-${string}`
  | "queryRuns"
  | `queryRun-${string}`
  | "fileExplorer"
  | "explorerTabs"
  | "autocompleteSchema"
  | "chartPanel"
  | "recentlyOpened"
  | "userState"
  | "discoverDashboards"
  | "databaseExplorer"
  | "currentUser"
  | "liveQuery"
  | "quickNodeEndpoints"
  | "googleNodeEndpoints"
  | `userProfiles`
  | `user-profile-${string}`;

const systemMap = new Map<ActorSystemKey, AnyActorRef>();
export const system$$ = new BehaviorSubject(systemMap);

const createActorSystem = () => {
  return {
    register: (actorRef: AnyActorRef, id: ActorSystemKey) => {
      systemMap.set(id, actorRef);
      system$$.next(systemMap);
      return actorRef.id;
    },
    bulkRegister: (actorRefs: Record<string, AnyActorRef>) => {
      Object.entries(actorRefs).forEach(([key, actorRef]) => {
        systemMap.set(key as ActorSystemKey, actorRef as AnyActorRef);
      });
      system$$.next(systemMap);
    },
    unregister: (id: ActorSystemKey) => {
      const actor = systemMap.get(id);
      if (!actor) return;
      actor.stop?.();
      systemMap.delete(id);
      system$$.next(systemMap);
    },
    get: <T extends AnyActorRef>(key: ActorSystemKey) => {
      return systemMap.get(key) as T | undefined;
    },
    set: (key: ActorSystemKey, actorRef: AnyActorRef) => {
      systemMap.set(key, actorRef);
      system$$.next(systemMap);
    },
  };
};

export const actorSystem = createActorSystem();

const useInterpretMachines = (initialUserState: UserState, user?: CurrentUser) => {
  const nav = useNavigate();
  const [visualizations] = useState(() => createVisualizationsMachine());
  const [workItems] = useState(() => createWorkItemsMachine());
  const [fileExplorer] = useState(() => createFileExplorerMachine());
  const [navigate] = useState(() => createNavigationMachine(nav));
  const [explorerTabs] = useState(() => createExplorerTabsMachine());
  const [queries] = useState(() => createQueriesMachine());
  const [dashboards] = useState(() => createDashboardsMachine());
  const [autocompleteSchema] = useState(() => createAutocompleteSchemaMachine());
  const [queryRuns] = useState(() => createQueryRunsMachine());
  const [chartPanel] = useState(() => createChartPanelMachine());
  const [recentlyOpened] = useState(() => createRecentlyOpenedMachine());
  const [userState] = useState(() => createUserStateMachine(initialUserState));
  const [discoverDashboards] = useState(() => createDiscoverDashboardsMachine(initialDiscoverDashboardsData));
  const [databaseExplorer] = useState(() => createDatabaseExplorerMachine());
  const [currentUser] = useState(() => createCurrentUserMachine(user));
  const [liveQuery] = useState(() => createLiveQueryMachine());
  const [quickNodeEndpoints] = useState(() => createQuickNodeEndpointsMachine());
  const [googleNodeEndpoints] = useState(() => createGoogleNodeEndpointsMachine());
  const [userProfiles] = useState(() => createUserProfilesMachine());
  const services = {
    currentUser: useInterpret(currentUser).start(),
    visualizations: useInterpret(visualizations),
    workItems: useInterpret(workItems),
    fileExplorer: useInterpret(fileExplorer),
    navigate: useInterpret(navigate),
    explorerTabs: useInterpret(explorerTabs),
    queries: useInterpret(queries),
    dashboards: useInterpret(dashboards),
    autocompleteSchema: useInterpret(autocompleteSchema),
    queryRuns: useInterpret(queryRuns),
    chartPanel: useInterpret(chartPanel),
    recentlyOpened: useInterpret(recentlyOpened),
    userState: useInterpret(userState),
    discoverDashboards: useInterpret(discoverDashboards),
    databaseExplorer: useInterpret(databaseExplorer),
    liveQuery: useInterpret(liveQuery).start(),
    quickNodeEndpoints: useInterpret(quickNodeEndpoints).start(),
    googleNodeEndpoints: useInterpret(googleNodeEndpoints).start(),
    userProfiles: useInterpret(userProfiles).start(),
  };
  return services;
};

export const AppStateProvider: React.FC<
  React.PropsWithChildren<{
    initialUserState: UserState;
    featureFlags: Record<string, string | boolean>;
    user?: CurrentUser;
  }>
> = ({ children, initialUserState, featureFlags, user }) => {
  const {
    visualizations,
    workItems,
    fileExplorer,
    navigate,
    explorerTabs,
    queries,
    dashboards,
    queryRuns,
    autocompleteSchema,
    chartPanel,
    recentlyOpened,
    userState,
    discoverDashboards,
    databaseExplorer,
    currentUser,
    liveQuery,
    quickNodeEndpoints,
    googleNodeEndpoints,
    userProfiles,
  } = useInterpretMachines(initialUserState, user);
  useRunOnce(() => {
    featureFlags$$.next(featureFlags);
    databaseExplorer.start();
    actorSystem.bulkRegister({
      visualizations,
      workItems,
      fileExplorer,
      navigate,
      explorerTabs,
      queries,
      dashboards,
      autocompleteSchema,
      queryRuns,
      chartPanel,
      recentlyOpened,
      userState,
      discoverDashboards,
      databaseExplorer,
      currentUser,
      liveQuery,
      quickNodeEndpoints,
      googleNodeEndpoints,
      userProfiles,
    });
  });
  return <>{children}</>;
};
