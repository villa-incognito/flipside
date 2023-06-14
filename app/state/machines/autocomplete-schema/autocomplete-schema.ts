import { ActorRefFrom, StateFrom, assign } from "xstate";
import { createMachine } from "xstate";
import { DatabaseDefinition } from "lang-sql/src";

import localforage from "localforage";
import { isCacheValid } from "~/features/query/utils/is-cache-valid";
import { actorSystem } from "~/state/system";
import { QueriesActorRef } from "../query";

export const createAutocompleteSchemaMachine = () => {
  const machine = createMachine(
    {
      id: `autocomplete-schema`,
      tsTypes: {} as import("./autocomplete-schema.typegen").Typegen0,
      schema: {
        context: {} as AutoCompleteSchemaContext,
        events: {} as AutoCompleteSchemaEvent,
      },
      context: {
        schema: [],
      },
      initial: "checkStorage",
      states: {
        checkStorage: {
          description: "Check if the schema is in local storage",
          invoke: {
            id: "checkStorage",
            src: "checkStorage",
            onError: {
              target: "error",
            },
            onDone: [
              {
                cond: "isCacheValid",
                description: "If the cache is present and still valid use that",
                target: "fetched",
                actions: ["useSchemaFromLocalStorage", "informQueryEditors"],
              },
              {
                description: "If the cache is not present or is not valid, fetch from the server",
                target: "fetchNewSchema",
              },
            ],
          },
        },
        fetchNewSchema: {
          invoke: {
            id: "fetchSchema",
            src: "fetchSchema",
            onError: {
              target: "error",
            },
            onDone: [
              {
                cond: "isSchemaDataValid",
                description: "Check to see if the data coming back from the server is valid",
                target: "fetched",
                actions: ["useNewSchemaData", "informQueryEditors"],
              },
              {
                description: "If there is no data coming back from the server enter the errored state",
                target: "error",
              },
            ],
          },
        },
        fetched: {
          invoke: {
            id: "saveSchemaToLocalStorage",
            src: "saveSchemaToLocalStorage",
            onDone: {
              target: "withData",
            },
            onError: {
              target: "error",
            },
          },
        },
        withData: {},
        error: {},
      },
    },
    {
      actions: {
        useSchemaFromLocalStorage: assign((context, event) => {
          return { schema: event.data?.schema ?? [] };
        }),
        useNewSchemaData: assign((context, event) => {
          return { schema: event.data?.schema };
        }),
        informQueryEditors: (context, event) => {
          const queries = actorSystem.get<QueriesActorRef>("queries")?.getSnapshot()?.context.queries ?? [];
          // const queries = ctx.queries.filter((q) => q.getSnapshot()!.context.query.id !== ev.queryId);
          queries.forEach((q) => {
            const codeMirrorRef = q.getSnapshot()?.context.codeMirrorRef;
            codeMirrorRef?.send({ type: "CODE_MIRROR.SET_SCHEMA", schema: event.data?.schema ?? [] });
          });
        },
      },
      guards: {
        isCacheValid: (context, { data }) => {
          return !!data?.timestamp && isCacheValid(data.timestamp) && data.schema.length > 0;
        },
        isSchemaDataValid: (context, { data }) => {
          return !!data?.schema && data.schema.length > 0;
        },
      },
      services: {
        checkStorage: async () => {
          const storedData = await localforage.getItem<{ schema: DatabaseDefinition[]; timestamp: Date }>(
            "autocomplete-schema"
          );

          return storedData?.schema ? storedData : undefined;
        },
        fetchSchema: () => {
          const url = window.location.protocol + "//" + window.location.host + "/api/schemas";
          return fetch(url).then((response) => response.json());
        },
        saveSchemaToLocalStorage: (context) => {
          const data = {
            timestamp: new Date().getTime(),
            schema: context.schema,
          };
          return localforage.setItem("autocomplete-schema", data);
        },
      },
    }
  );
  return machine;
};

type AutoCompleteSchemaContext = {
  schema: DatabaseDefinition[];
};

type AutoCompleteSchemaEvent =
  | { type: "SCHEMA_READY"; schema: DatabaseDefinition[] }
  | {
      type: "loading.invoke.checkStorage";
      data?: {
        schema?: DatabaseDefinition[];
        timestamp: Date;
      };
    }
  | {
      type: "done.invoke.checkStorage";
      data?: {
        schema: DatabaseDefinition[];
        timestamp: Date;
      };
    }
  | {
      type: "done.invoke.fetchSchema";
      data?: {
        schema: DatabaseDefinition[];
      };
    };

export type AutocompleteSchemaRef = ActorRefFrom<ReturnType<typeof createAutocompleteSchemaMachine>>;
export type AutocompleteSchemaState = StateFrom<ReturnType<typeof createAutocompleteSchemaMachine>>;
