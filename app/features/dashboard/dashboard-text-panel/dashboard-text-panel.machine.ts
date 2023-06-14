import type { ActorRefFrom, StateFrom } from "xstate";
import { createMachine, assign, sendParent } from "xstate";
import { cleanHtml } from "../util/clean-html";
import { useSelector } from "@xstate/react";

interface TextPanelProps {
  cellId: string;
  text: string;
}

export const createTextPanelMachine = ({ cellId, text }: TextPanelProps) => {
  const machine = createMachine(
    {
      id: `textPanel-${cellId}`,
      tsTypes: {} as import("./dashboard-text-panel.machine.typegen").Typegen0,
      schema: {
        context: {} as TextPanelContext,
        events: {} as TextPanelEvent,
      },
      context: {
        text,
        cellId,
      },
      initial: "idle",
      states: {
        edit: {
          on: {
            "DASHBOARD.TEXT_PANEL.TOGGLE": "idle",
          },
        },
        idle: {
          on: {
            "DASHBOARD.TEXT_PANEL.TOGGLE": "edit",
          },
        },
      },
      on: {
        "DASHBOARD.TEXT_PANEL.UPDATE_TEXT": {
          actions: ["updateCellFormula", "updateParentCellFormula"],
          cond: "hasChanged",
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
      },
      guards: {
        hasChanged: (context, event) => {
          return context.text !== event.value;
        },
      },
    }
  );
  return machine;
};

interface TextPanelContext {
  text: string;
  cellId: string;
}

type TextPanelEvent =
  | {
      type: "DASHBOARD.TEXT_PANEL.TOGGLE";
    }
  | {
      type: "DASHBOARD.TEXT_PANEL.UPDATE_TEXT";
      value: string;
    };

export type TextPanelActorRef = ActorRefFrom<ReturnType<typeof createTextPanelMachine>>;
export type TextPanelActorState = StateFrom<ReturnType<typeof createTextPanelMachine>>;

export const useTextPanelMachine = (cellRef: TextPanelActorRef) => {
  const toggleEditing = () => cellRef.send({ type: "DASHBOARD.TEXT_PANEL.TOGGLE" });
  const updateText = (value: string) => cellRef.send({ type: "DASHBOARD.TEXT_PANEL.UPDATE_TEXT", value });
  return {
    isEditing: useSelector(cellRef, isEditingSelector),
    text: useSelector(cellRef, textSelector),
    toggleEditing,
    updateText,
  };
};

const isEditingSelector = (state: TextPanelActorState) => {
  return state.matches("edit");
};

const textSelector = (state: TextPanelActorState) => {
  return state.context.text;
};
