import type { dashboard } from "@fscrypto/domain";
import { sortLayoutItemsByRowCol } from "./sort-layout-Items";
// import { sortLayoutItemsByRowCol } from "./sortLayoutItemsByRowCol";

/** this loops through the components and normalizes the data
 * to a format compatible with GridLayout. For responsiveness,
 * when the width is below the breakpoint, each item is full width.
 */

export const createLayout = (
  cells: dashboard.Cell[],
  containerWidth: number,
  activeTabId?: string
): dashboard.Component[] => {
  if (!cells.length) {
    return [];
  }

  let layout: dashboard.Component[] = cells
    .map((cell: dashboard.Cell) => ({
      ...cell.component,
      i: cell.id,
    }))
    .filter((cell) => {
      if (activeTabId !== undefined) {
        return cell.t === activeTabId;
      }
      return true;
    });

  //Sort for mobile
  if (containerWidth !== 0 && containerWidth <= 800) {
    layout = sortLayoutItemsByRowCol(layout).map((component, index) => ({ ...component, w: 12, y: index, x: 0 }));
  }

  return layout;
};
