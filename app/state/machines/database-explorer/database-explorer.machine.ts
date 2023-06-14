import { dataSchema } from "@fscrypto/domain";
import { useSelector } from "@xstate/react";
import { ActorRefFrom, assign, createMachine } from "xstate";
import { actorSystem } from "~/state";
import { globalEvents$$, type GlobalEvent } from "~/state/events";
import { GetSchemaTreeEvent, getSchemaTree$ } from "./getSchema";
export const createDatabaseExplorerMachine = () =>
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QQIYBcUCMWzAUQA8AHAGwHsAnMCgYgBEBBAFQYCEGBlPAfTwA0ACgBkA8gCU8YgHRcm3BgGEmASQBqPFqyF4A2gAYAuolBEysAJZpzZAHbGQBRACYA7AA4pATgCs3gCyefi4AzN4AjGFObgA0IACeiBGeUnp+qSFuLgBs3m6p3gC+BbGoGNi4hKSU1PTMbJw8-MLikjJ4cpra3AoiQgCqALIAchzcABJ4ygDiY0z6RkggphZWtvaOCE7BWVIufn7eWU56LmFBWTHxzk5SuSHBmS6eWTmeYcFFJehYOPjE5FQKFIAMbkXAQWqaBq8QSiCTSEQCPBDeb2ZaWax2RYbMLeG5PM7BPRuMJuUJ+LKxBIIPxuPxSNyeTxuLJ+JxpbzbLKfEClH4Vf7VIFkIhgGyQ+pcGHNeFtOSKFTqbidXSGNFmDFrbGIIJ6KSk47eZ6MtzhJyUq4IB47fZZPa+E3+Pw8vnlP5VQFSEViiXsKVNOGtWTKthdHr9YajCbTWaoxbo1ZY0AbNkuLynSIuPTmpy44JU5yMryebZhVKeJwl5ku75uyoA6he0XixhQ-2wlrSBSiLhxkwaxPrRJ43ZvPxEklk-wW6nj+nBJmmwJRO1ZD48mxkCBweyu371oXqlaYocIAC0N1px2zbjJ5rCTxLBc22akAVLTOC2QCbhrZX3gqeqCZiQEempJg4OreLcD5MhmdoPE4z5BGmwRhDkX5+GcLzBE4f78u6DbCs2YGDtqCBZHoyQLlkbzBF+lFZt4yGZAyi55Bcq6MkURRAA */
      id: "databaseExplorer",
      predictableActionArguments: true,
      tsTypes: {} as import("./database-explorer.machine.typegen").Typegen0,
      schema: {
        context: {} as DatabaseExplorerContext,
        events: {} as DatabaseExplorerEvent | GlobalEvent,
      },
      context: {
        activeTable: null,
        tableColumnsHeight: 200,
        activeQueryId: null,
        schemaTree: [],
      },
      initial: "closed",
      invoke: {
        id: "global-events",
        src: "globalEvents",
      },
      on: {
        "GLOBAL.SET_ACTIVE_QUERY": {
          actions: ["setActiveQuery"],
        },
      },
      states: {
        closed: {
          on: {
            "DATABASE_EXPLORER.OPEN": {
              target: "open",
            },
          },
        },
        open: {
          invoke: {
            id: "fetch-schema-tree",
            src: "fetchSchemaTree",
          },
          on: {
            SCHEMA_LOADED: {
              actions: ["setSchemaTree"],
            },
            "DATABASE_EXPLORER.SET_SCHEMA_TREE": {
              actions: ["setSchemaTree"],
            },
            "DATABASE_EXPLORER.SET_ACTIVE_TABLE": {
              actions: ["setActiveTable"],
            },
            "DATABASE_EXPLORER.SET_TABLE_COLUMNS_HEIGHT": {
              actions: ["setTableColumnsHeight"],
            },
            "DATABASE_EXPLORER.CLOSE": {
              target: "closed",
            },
          },
        },
      },
    },
    {
      actions: {
        setActiveQuery: assign((_, e) => ({
          activeQueryId: e.payload,
        })),
        setActiveTable: assign((_, e) => ({
          activeTable: e.payload,
        })),
        setTableColumnsHeight: assign((_, e) => ({
          tableColumnsHeight: e.payload,
        })),
        setSchemaTree: assign((_, e) => ({
          schemaTree: e.payload,
        })),
      },
      services: {
        globalEvents: () => globalEvents$$,
        fetchSchemaTree: () => getSchemaTree$(),
      },
    }
  );

interface DatabaseExplorerContext {
  activeTable: dataSchema.DataSchemaNode | null;
  tableColumnsHeight: number;
  activeQueryId: string | null;
  schemaTree: dataSchema.DataSchemaNode[];
}
type DatabaseExplorerEvent =
  | { type: "DATABASE_EXPLORER.CLOSE" }
  | { type: "DATABASE_EXPLORER.OPEN" }
  | { type: "DATABASE_EXPLORER.SET_ACTIVE_TABLE"; payload: dataSchema.DataSchemaNode | null }
  | { type: "DATABASE_EXPLORER.SET_TABLE_COLUMNS_HEIGHT"; payload: number }
  | { type: "DATABASE_EXPLORER.SET_SCHEMA_TREE"; payload: dataSchema.DataSchemaNode[] }
  | GetSchemaTreeEvent;

export type DatabaseExplorerActorRef = ActorRefFrom<ReturnType<typeof createDatabaseExplorerMachine>>;

export const useDatabaseExplorer = () => {
  const ref = actorSystem.get<DatabaseExplorerActorRef>("databaseExplorer")!;
  const activeTable = useSelector(ref, (state) => state.context.activeTable);
  const activeQueryId = useSelector(ref, (state) => state.context.activeQueryId);
  const tableColumnsHeight = useSelector(ref, (state) => state.context.tableColumnsHeight);
  const schemaTree = useSelector(ref, (state) => state.context.schemaTree);
  return {
    activeTable,
    activeQueryId,
    tableColumnsHeight,
    schemaTree,
    setOpen: () => ref.send({ type: "DATABASE_EXPLORER.OPEN" }),
    setClosed: () => ref.send({ type: "DATABASE_EXPLORER.CLOSE" }),
    setActiveTable: (payload: dataSchema.DataSchemaNode | null) =>
      ref.send({ type: "DATABASE_EXPLORER.SET_ACTIVE_TABLE", payload }),
    setTableColumnsHeight: (payload: number) =>
      ref.send({ type: "DATABASE_EXPLORER.SET_TABLE_COLUMNS_HEIGHT", payload }),
  };
};
