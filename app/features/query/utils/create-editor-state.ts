import { defaultKeymap } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { indentWithTab } from "@codemirror/commands";
import { EditorState, StateEffect, Extension } from "@codemirror/state";
import { sql } from "lang-sql";
import { light, dark } from "../utils/code-mirror-themes";
import { EditorView } from "@codemirror/view";
import { DatabaseDefinition } from "lang-sql/src";
import { insertNewline } from "@codemirror/commands";

interface CreateEditorStateProps {
  schema: DatabaseDefinition[];
  onChangeListener: Extension;
  statement?: string;
  disabled: boolean;
  theme?: "light" | "dark";
}

export const createEditorState = ({ schema, onChangeListener, statement, disabled, theme }: CreateEditorStateProps) => {
  const editorState = EditorState.create({
    doc: statement,
    extensions: [
      onChangeListener,
      sql({ schema: schema, upperCaseKeywords: true }),
      ...createDefaultExtensions({ disabled }),
      theme === "light" ? light : dark,
    ],
  });
  return editorState;
};

interface UpdateStateWithExtensionsProps {
  view: EditorView;
  onChangeListener: Extension;
  schema: DatabaseDefinition[];
  disabled: boolean;
  theme?: "light" | "dark";
}
export const updateStateWithExtensions = ({
  view,
  onChangeListener,
  schema,
  disabled,
  theme,
}: UpdateStateWithExtensionsProps) => {
  view.dispatch({
    effects: StateEffect.reconfigure.of([
      onChangeListener,
      sql({ schema: schema, upperCaseKeywords: true }),
      ...createDefaultExtensions({ disabled }),
      theme === "light" ? light : dark,
    ]),
  });
};

export const createDefaultExtensions = ({ disabled }: { disabled: boolean }) => {
  return [
    keymap.of([
      indentWithTab,
      {
        key: "Mod-Enter",
        win: "Ctrl-Enter",
        linux: "Ctrl-Enter",
        mac: "Cmd-Enter",
        preventDefault: true,
        run: () => {
          return true;
        },
      },
      {
        key: "Enter",
        preventDefault: true,
        run: () => {
          // @ts-ignore
          insertNewline();
          return true;
        },
      },
      ...defaultKeymap,
    ]),
    basicSetup({
      defaultKeymap: false,
    }),
    disabled
      ? EditorView.contentAttributes.of({
          contentEditable: "false",
        })
      : EditorView.contentAttributes.of({
          contentEditable: "true",
        }),
  ];
};
