import { ActorRefFrom, Receiver, StateFrom, assign, sendTo } from "xstate";
import { createMachine } from "xstate";
import { DatabaseDefinition } from "lang-sql/src";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { createEditorState, updateStateWithExtensions } from "../utils/create-editor-state";
import { actorSystem } from "~/state";
import { formatAndReplace } from "~/shared/utils/format-and-replace-statement";
import { globalEvents$$, GlobalEvent } from "~/state/events";
import { QueriesActorRef, QueryActorRef } from "~/state/machines";
import { AutocompleteSchemaRef } from "~/state/machines/autocomplete-schema/autocomplete-schema";

interface CreateCodeMirrorMachineProps {
  statement?: string;
  queryId: string;
}

export const createCodeMirrorMachine = ({ queryId }: CreateCodeMirrorMachineProps) => {
  const machine = createMachine(
    {
      id: `QueryStatement`,
      tsTypes: {} as import("./code-mirror-machine.typegen").Typegen0,
      schema: {
        context: {} as QueryStatementContext,
        events: {} as CodeMirrorEvent | GlobalEvent,
      },
      invoke: {
        id: "global-events",
        src: () => globalEvents$$,
      },
      context: {
        schema: [],
        queryId,
        disabled: false,
        editorSet: false,
      },
      initial: "idle",
      on: {
        "CODE_MIRROR.SET_EDITOR": {
          description:
            "This marks the editor as set and moves to the editing state. This prevents multiple editors from being created",
          actions: ["setEditor", "setDisabled"],
          target: "editing",
          cond: (ctx) => !ctx.editorSet,
        },
        "CODE_MIRROR.UNMOUNT": {
          description: "This removes and destroys the EditorView instance",
          actions: ["unmountAndDestroy"],
          target: "unmounted",
        },
        "CODE_MIRROR.SET_SCHEMA": {
          actions: ["informEditorOfSchema"],
        },
        // "CODE_MIRROR.SET_THEME": {
        //   actions: ["setTheme"],
        // },
        "USER_STATE.UPDATED_THEME": {
          actions: ["setTheme"],
        },
      },
      states: {
        idle: {},
        editing: {
          on: {
            "CODE_MIRROR.SET_VIEW": {
              actions: ["setView"],
            },
            "CODE_MIRROR.UPDATE_STATE": {
              actions: ["updateState", "updateQueryStatement", "updateSelection", "updateParameters"],
            },
            "CODE_MIRROR.ADD_TO_STATEMENT": {
              actions: ["addToStatement"],
            },
            "CODE_MIRROR.FORMAT_STATEMENT": {
              actions: ["formatStatement"],
            },
          },
          invoke: {
            id: "activeEditor",
            src: "activeEditor",
          },
        },
        unmounted: {},
      },
    },
    {
      actions: {
        informEditorOfSchema: sendTo("activeEditor", (context, event) => ({
          type: "CODE_MIRROR.SET_SCHEMA",
          schema: event.schema,
        })),
        setTheme: sendTo("activeEditor", (context, event) => {
          return {
            type: "CODE_MIRROR.SET_THEME",
            theme: event.payload.theme,
          };
        }),
        setEditor: assign((_, event) => {
          actorSystem.get<QueriesActorRef>("queries")?.send({ type: "QUERIES.UNMOUNT_EDITORS", queryId });
          return {
            editorSet: true,
            theme: event.theme,
          };
        }),
        updateQueryStatement: (context) => {
          const queryActor = actorSystem.get<QueryActorRef>(`query-${context.queryId}`);
          const oldStatement = queryActor?.getSnapshot()?.context.query.statement;
          const newStatement = context.editorState?.doc.toString();
          if (oldStatement !== newStatement) {
            const parametersRef = queryActor?.getSnapshot()?.context.parametersRef;
            const parameters = parametersRef?.getSnapshot()?.context.parameters ?? [];
            queryActor?.send({
              type: "QUERY.UPDATE_REQUEST",
              payload: {
                statement: context.editorState?.doc.toString(),
                parameters: parameters,
              },
            });
          }
        },
        updateSelection: (context, event) => {
          const queryActor = actorSystem.get<QueryActorRef>(`query-${context.queryId}`);
          const selectionRef = queryActor?.getSnapshot()?.context.selectionRef;
          if (selectionRef) {
            const selection = event.state.sliceDoc(event.state.selection.main.from, event.state.selection.main.to);
            selectionRef.send({ type: "SELECTION.UPDATE", payload: selection });
          }
        },
        updateParameters: (context, event) => {
          const queryActor = actorSystem.get<QueryActorRef>(`query-${context.queryId}`);
          const parametersRef = queryActor?.getSnapshot()?.context.parametersRef;
          if (parametersRef) {
            parametersRef.send({ type: "PARAMETERS.UPDATE_PARAMETERS", payload: event.state });
          }
        },
        updateState: assign((context, event) => {
          return {
            editorState: event.state,
          };
        }),
        setView: assign((ctx, event) => {
          return {
            editorView: event.editorView,
          };
        }),
        setDisabled: assign((ctx, event) => {
          return {
            disabled: event.disabled,
          };
        }),
        unmountAndDestroy: assign((context) => {
          context.editorView?.destroy();
          return {
            editorSet: false,
            editorView: undefined,
          };
        }),
        addToStatement: (context, event) => {
          const editor = context.editorView;
          if (!editor) return; // Can't assign if we don't have an editor
          const currentPosition = editor.state.selection.ranges[0]?.from ?? 0;
          editor.dispatch({
            changes: { from: currentPosition, insert: event.payload },
          });
        },
        formatStatement: (context) => {
          const editor = context.editorView;
          if (!editor) return; // Can't assign if we don't have an editor
          const formattedStatement = formatAndReplace(editor.state.doc.toString());
          editor.dispatch({
            changes: { from: 0, to: editor.state.doc.toString().length, insert: formattedStatement },
          });
        },
      },
      services: {
        activeEditor: (context) => (sendBack, received: Receiver<CodeMirrorEvent>) => {
          // Get the DOm reference to the code mirror element
          const ref = document.getElementById("code-mirror-editor");
          if (!ref) {
            console.log("no ref");
            return;
          }
          // Create a new EditorView instance
          let view: EditorView;
          const onChangeExtension = EditorView.updateListener.of((update) => {
            sendBack({ type: "CODE_MIRROR.UPDATE_STATE", state: update.state });
          });

          const schema =
            actorSystem.get<AutocompleteSchemaRef>("autocompleteSchema")?.getSnapshot()?.context.schema ?? [];

          // If there is no editor state, create a new one
          if (!context.editorState) {
            const queryActor = actorSystem.get<QueryActorRef>(`query-${context.queryId}`);
            const statement = queryActor?.getSnapshot()?.context.query.statement;
            // create new editor State
            const editorState = createEditorState({
              statement: statement,
              schema: schema,
              onChangeListener: onChangeExtension,
              disabled: context.disabled,
              theme: context.theme,
            });
            sendBack({ type: "CODE_MIRROR.UPDATE_STATE", state: editorState });
            view = new EditorView({
              state: editorState,
              parent: ref,
            });
            sendBack({ type: "CODE_MIRROR.SET_VIEW", editorView: view });
            view.focus();
          } else {
            // If there is an editor state, use that
            view = new EditorView({
              state: context.editorState,
              parent: ref,
            });
            updateStateWithExtensions({
              view,
              onChangeListener: onChangeExtension,
              schema: schema,
              disabled: context.disabled,
              theme: context.theme,
            });
            // store instance of editor view in memory
            sendBack({ type: "CODE_MIRROR.SET_VIEW", editorView: view });
            view.focus();
          }
          received((event) => {
            if (event.type === "CODE_MIRROR.SET_SCHEMA") {
              updateStateWithExtensions({
                view,
                onChangeListener: onChangeExtension,
                schema: event.schema,
                disabled: context.disabled,
                theme: context.theme,
              });
            }
            if (event.type === "CODE_MIRROR.SET_THEME") {
              updateStateWithExtensions({
                view,
                onChangeListener: onChangeExtension,
                schema: context.schema,
                disabled: context.disabled,
                theme: event.theme,
              });
            }
          });
          return () => {};
        },
      },
    }
  );
  return machine;
};

type QueryStatementContext = {
  editorView?: EditorView;
  queryId: string;
  editorState?: EditorState;
  schema: DatabaseDefinition[];
  disabled: boolean;
  editorSet: boolean;
  theme?: "light" | "dark";
};

type CodeMirrorEvent =
  | { type: "CODE_MIRROR.SET_EDITOR"; disabled?: boolean; theme: "light" | "dark" }
  | { type: "CODE_MIRROR.UPDATE_STATE"; state: EditorState }
  | { type: "CODE_MIRROR.SET_VIEW"; editorView: EditorView }
  | { type: "CODE_MIRROR.UNMOUNT" }
  | { type: "CODE_MIRROR.DESTROY_VIEW" }
  | { type: "CODE_MIRROR.SET_SCHEMA"; schema: DatabaseDefinition[] }
  | { type: "CODE_MIRROR.ADD_TO_STATEMENT"; payload: string }
  | { type: "CODE_MIRROR.FORMAT_STATEMENT" }
  | { type: "CODE_MIRROR.SET_THEME"; theme: "light" | "dark" };

export const useCodeMirrorMachine = ({ queryId }: { queryId: string }) => {
  const queryRef = actorSystem.get<QueryActorRef>(`query-${queryId}`)!;
  const codeMirrorRef = queryRef?.getSnapshot()?.context.codeMirrorRef;
  return codeMirrorRef?.send!;
};

export type CodeMirrorRef = ActorRefFrom<ReturnType<typeof createCodeMirrorMachine>>;
export type CodeMirrorState = StateFrom<ReturnType<typeof createCodeMirrorMachine>>;
