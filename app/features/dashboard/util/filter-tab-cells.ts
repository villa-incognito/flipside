import { CellWithRef } from "./spawn-panel-machine";

interface FilterCellsArgs {
  cells: CellWithRef[];
  activeTabId?: string;
}

export const filterTabCells = ({ cells, activeTabId }: FilterCellsArgs) => {
  const draftCells = (cells ?? []).filter((cell) => {
    if (activeTabId !== undefined) {
      return cell.component.t === activeTabId;
    }
    return true;
  });
  return draftCells;
};
