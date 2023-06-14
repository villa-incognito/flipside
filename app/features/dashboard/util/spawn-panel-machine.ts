import invariant from "tiny-invariant";

import { spawn } from "xstate";
import { Cell } from "@fscrypto/domain/src/dashboard";
import { TextPanelActorRef, createTextPanelMachine } from "../dashboard-text-panel";
import { ImagePanelActorRef, createImagePanelMachine } from "../dashboard-image-panel/dashboard-image-panel.machine";
import {
  HeadingPanelActorRef,
  createHeadingPanelMachine,
} from "../dashboard-heading-panel/dashboard-heading-panel.machine";
import { TablePanelActorRef, createTablePanelMachine } from "../dashboard-table-panel/dashboard-table-panel.machine";
import {
  VisualizationPanelActorRef,
  createVisualizationPanelMachine,
} from "../dashboard-visualizations-panel/dashboard-visualization-panel.machine";

export const spawnPanelMachine = (cell: Cell, dashboardId: string) => {
  invariant(cell.id, "cell id is required");
  switch (true) {
    case cell.component.type === "QueryVisual":
      if (cell.formula && "visId" in cell.formula) {
        return spawn(
          createVisualizationPanelMachine({
            cellId: cell.id,
            cell,
            visId: cell.formula?.visId,
            dashboardId,
          })
        );
      }
    case cell.component.type === "QueryTable":
      if (cell.formula && "queryId" in cell.formula) {
        return spawn(
          createTablePanelMachine({
            cellId: cell.id,
            queryId: cell.formula?.queryId,
            dashboardId,
          })
        );
      }
    case cell.component.type === "Image":
      if (cell.formula && "imageName" in cell.formula) {
        return spawn(createImagePanelMachine({ cellId: cell.id, url: cell.formula.imageName }));
      }
    case cell.component.type === "Text":
      if (cell.formula && "text" in cell.formula) {
        return spawn(createTextPanelMachine({ cellId: cell.id, text: cell.formula.text }));
      }
    case cell.component.type === "Heading":
      if (cell.formula && "text" in cell.formula) {
        const styles = cell.styles ?? {};
        return spawn(createHeadingPanelMachine({ cellId: cell.id, text: cell.formula.text, styles }));
      }
    default:
      return spawn(createTextPanelMachine({ cellId: cell.id, text: "default cell" }));
  }
};

export type CellWithRef = Cell & {
  ref: HeadingPanelActorRef | ImagePanelActorRef | TablePanelActorRef | VisualizationPanelActorRef | TextPanelActorRef;
};
