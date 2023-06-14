import { Subject } from "rxjs";
import { UserStateOutputEvents } from "./machines/user-state/user-state";
import { ToasterGlobalEvent } from "~/features/toasts/machines/toasts-machine";
import { WorkItemsGlobalEvent } from "./machines/work-items/work-items";
import { WorkItemGlobalEvent } from "./machines/work-items/work-item";
import { MoveWorkItemGlobalEvent } from "~/features/move-work-item/machines/move-work-item-machine";
import { GlobalQueryEvent, GlobalQueryRunEvent } from "./machines";
import { GlobalDashboardEvent } from "~/features/dashboard";
import { GlobalAddDashboardEvent } from "~/features/add-to-dashboard/machines/add-to-dashboard-machine";
import { GlobalStudioEvent } from "~/features/studio";

export type GlobalEvent =
  | ToasterGlobalEvent
  | UserStateOutputEvents
  | WorkItemsGlobalEvent
  | WorkItemGlobalEvent
  | MoveWorkItemGlobalEvent
  | GlobalDashboardEvent
  | GlobalQueryRunEvent
  | GlobalQueryEvent
  | GlobalAddDashboardEvent
  | GlobalStudioEvent
  | { type: "GLOBAL.SET_ACTIVE_QUERY"; payload: string | null };

/**
 * To listen for global events in an actor, simply invoke
 * this subject at the root level and add `GlobalEvents`
 * to the inferred event type.
 *
 * invoke: {
 *   id: "global-events",
 *   src: () => globalEvents$$,
 * }
 */

export const globalEvents$$ = new Subject<GlobalEvent>();

export const sendGlobalEvent = (event: GlobalEvent) => {
  globalEvents$$.next(event);
};
