import { ActorRefFrom, assign, createMachine } from "xstate";
import { fetchTablePreview } from "../async/fetch-table-preview";
import { QueryRunResult } from "~/services/legacy-query-run-service.server";

export const createTablePreviewMachine = ({ table }: { table: string }) => {
  const tablePreviewMachine = createMachine(
    {
      id: "previewTable",
      tsTypes: {} as import("./table-preview-machine.typegen").Typegen0,
      schema: {
        context: {} as TablePreviewContext,
        events: {} as TablePreviewEvent,
      },
      initial: "init",
      context: {},
      states: {
        init: {
          invoke: {
            id: "fetchTablePreview",
            src: "fetchTablePreview",
            onDone: {
              target: "success",
              actions: "setTablePreview",
            },
            onError: "error",
          },
        },
        success: {},
        error: {},
      },
    },
    {
      actions: {
        setTablePreview: assign((context, event) => {
          return {
            tablePreview: event.data,
          };
        }),
      },
      services: {
        fetchTablePreview: () => fetchTablePreview(table),
      },
    }
  );
  return tablePreviewMachine;
};

interface TablePreviewContext {
  tablePreview?: QueryRunResult;
}

export type TablePreviewRef = ActorRefFrom<ReturnType<typeof createTablePreviewMachine>>;

type TablePreviewEvent = {
  type: "done.invoke.fetchTablePreview";
  data: QueryRunResult;
};
