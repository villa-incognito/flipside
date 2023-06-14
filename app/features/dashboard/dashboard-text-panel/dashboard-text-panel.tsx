import { ClientOnly } from "remix-utils";
import { ParentSize } from "@visx/responsive";
import { Markdown } from "./markdown.client";
import type { dashboard } from "@fscrypto/domain";
import { TextArea } from "./text-editor";
import clsx from "clsx";
import { TextPanelActorRef, useTextPanelMachine } from "./dashboard-text-panel.machine";
import { CellWithRef } from "../util/spawn-panel-machine";

interface TextCellProps {
  cell: CellWithRef;
  isEditable?: boolean;
}
export type CellWithTextPanelActorRef = dashboard.Cell & { ref: TextPanelActorRef };

export const DashboardTextPanel = ({ cell, isEditable }: TextCellProps) => {
  const { toggleEditing, isEditing, updateText, text } = useTextPanelMachine(cell.ref as TextPanelActorRef);
  return (
    <ParentSize>
      {({ height }) => (
        <ClientOnly>
          {() => (
            <div
              className={clsx("h-full w-full", { "pt-6": isEditable && !isEditing })}
              onMouseDown={(e) => {
                if (isEditing) {
                  e.stopPropagation();
                }
              }}
              onClick={(e) => {
                if (!isEditing) {
                  e.stopPropagation();
                  isEditable && toggleEditing();
                }
              }}
            >
              {isEditing ? (
                <TextArea
                  value={text}
                  onChange={updateText}
                  toggleEditing={() => {
                    isEditable && toggleEditing();
                  }}
                  isEditable={!!isEditable}
                />
              ) : (
                <Markdown height={height} value={text} toggleEditing={() => isEditable && toggleEditing()} />
              )}
            </div>
          )}
        </ClientOnly>
      )}
    </ParentSize>
  );
};
