import type { ActorRefFrom, StateFrom } from "xstate";
import { createMachine, assign, sendParent } from "xstate";
import { dashboard } from "@fscrypto/domain";
import { cleanHtml } from "../util/clean-html";
import { useSelector } from "@xstate/react";

interface HeadingPanelProps {
  cellId: string;
  text: string;
  styles: dashboard.Styles;
}

export const createHeadingPanelMachine = ({ cellId, text, styles }: HeadingPanelProps) => {
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgBsB7dCAqAYggsJIIDcKBrMEgMzABccANVywArujK4AXun64mAbQAMAXUSgADhVi55TDSAAeiACzKAzCWWmAbAA4A7AFYANCACeiAIyOAnNYATBamFi4AvuHuaFh4hKSU1LR0YABOqRSpJJpkcjyZqLwCwqISUrL6+CrqSCDaupWGJgjmVjYOLu5eCPaBJM6R0Rg4BMQkaRmpdEaw-HLc6Dz8aciByutEdDEj8ePpmdWG9XoK+E2Ijt7KJCFhbp6Ivf2RUSD4FBBwhttxxEc6JwMtWaAFpbF1EGDBiAfqMElQaPgoP8Gqdzi1AhCEN5bBZobDdrgIGQwCjAWdgY8LFZbIF7t1vH4rANXgSxhNMmTGpSELTrr17N46VjBc8XkA */
  const machine = createMachine(
    {
      id: `headingPanel-${cellId}`,
      tsTypes: {} as import("./dashboard-heading-panel.machine.typegen").Typegen0,
      schema: {
        context: {} as HeadingPanelContext,
        events: {} as HeadingPanelEvent,
      },
      context: {
        text,
        cellId,
        styles,
      },
      initial: "idle",
      states: {
        edit: {
          on: {
            "DASHBOARD.HEADER_PANEL.UPDATE_TEXT": {
              target: "idle",
              actions: ["updateCellFormula", "updateParentCellFormula"],
            },
          },
        },
        idle: {
          on: {
            "DASHBOARD.HEADER_PANEL.TOGGLE": "edit",
            "DASHBOARD.HEADER_PANEL.UPDATE_STYLES": {
              target: "idle",
              actions: ["updateCellStyles", "updateParentCellStyles"],
            },
          },
        },
      },
    },
    {
      actions: {
        updateParentCellFormula: sendParent((context, event) => {
          return {
            type: "DASHBOARD.GRID.UPDATE_CELL_FORMULA",
            payload: {
              cellId: context.cellId,
              formula: {
                text: cleanHtml(event.value),
              },
            },
          };
        }),
        updateCellFormula: assign((context, event) => {
          return {
            text: cleanHtml(event.value),
          };
        }),
        updateParentCellStyles: sendParent((context, event) => {
          return {
            type: "DASHBOARD.GRID.UPDATE_STYLES",
            payload: {
              cellId: context.cellId,
              styles: event.value,
            },
          };
        }),
        updateCellStyles: assign((context, event) => {
          return {
            styles: event.value,
          };
        }),
      },
    }
  );
  return machine;
};

interface HeadingPanelContext {
  text: string;
  cellId: string;
  styles: dashboard.Styles;
}

type HeadingPanelEvent =
  | {
      type: "DASHBOARD.HEADER_PANEL.TOGGLE";
    }
  | {
      type: "DASHBOARD.HEADER_PANEL.UPDATE_TEXT";
      value: string;
    }
  | {
      type: "DASHBOARD.HEADER_PANEL.UPDATE_STYLES";
      value: dashboard.Styles;
    };

export type HeadingPanelActorRef = ActorRefFrom<ReturnType<typeof createHeadingPanelMachine>>;
export type HeadingPanelState = StateFrom<ReturnType<typeof createHeadingPanelMachine>>;

export const useHeadingPanelMachine = (cellRef: HeadingPanelActorRef) => {
  const isEditing = useSelector(cellRef, isEditingSelector);
  const styles = useSelector(cellRef, stylesSelector);
  const text = useSelector(cellRef, testSelector);

  const toggleEditing = () => cellRef.send("DASHBOARD.HEADER_PANEL.TOGGLE");
  const updateText = (value: string) => cellRef.send({ type: "DASHBOARD.HEADER_PANEL.UPDATE_TEXT", value });
  const updateStyles = (value: dashboard.Styles) =>
    cellRef.send({ type: "DASHBOARD.HEADER_PANEL.UPDATE_STYLES", value });

  return {
    isEditing,
    toggleEditing,
    updateText,
    updateStyles,
    styles,
    text,
  };
};

const isEditingSelector = (state: HeadingPanelState) => {
  return state.matches("edit");
};

const stylesSelector = (state: HeadingPanelState) => {
  return state.context.styles;
};

const testSelector = (state: HeadingPanelState) => {
  return state.context.text;
};
