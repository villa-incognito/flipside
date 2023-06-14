import { ActorRefFrom, assign, createMachine } from "xstate";
import { actorSystem } from "~/state/system";
import type { SortingState } from "@fscrypto/table";

export const createTableStateMachine = () => {
  return createMachine(
    {
      id: "table-state-machine",
      tsTypes: {} as import("./table-state-machine.typegen").Typegen0,
      schema: {
        context: {} as TableStateContext,
        events: {} as TableStateEvents,
      },
      initial: "init",
      context: {
        tablesSortFormat: { realtime: [], selection: [], preview: {} },
      },
      on: {
        UPDATE_TABLES_SORT_FORMAT: {
          actions: "updateTablesSortFormat",
        },
      },
      states: {
        init: {},
      },
    },
    {
      actions: {
        updateTablesSortFormat: assign((context, event) => {
          return { tablesSortFormat: { ...context.tablesSortFormat, ...event.sort } };
        }),
      },
    }
  );
};

type TableStateContext = {
  tablesSortFormat: tablesSortType;
};
type TableStateEvents = {
  type: "UPDATE_TABLES_SORT_FORMAT";
  sort: tablesSortEvent;
};

type tableTypes = "realtime" | "selection" | "preview";
type tablesSortType = {
  realtime: SortingState;
  selection: SortingState;
  preview: Record<string, SortingState>;
};
export type tablesSortEvent =
  | { realtime: SortingState }
  | { selection: SortingState }
  | { preview: Record<string, SortingState> };

export type tableStateRef = ActorRefFrom<ReturnType<typeof createTableStateMachine>>;

export function resetTableState(queryId: string, table: tableTypes) {
  //reset sorting on run (might be different columns to sort by)
  const sort = { [table]: [] } as unknown as tablesSortEvent;
  actorSystem
    .get(`query-${queryId}`)
    ?.getSnapshot()
    ?.context.resultsPanelRef?.getSnapshot()
    ?.context.tableStateRef?.send({ type: "UPDATE_TABLES_SORT_FORMAT", sort });
}
