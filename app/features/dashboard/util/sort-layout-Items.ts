import type { dashboard } from "@fscrypto/domain";

/**
 * Sort layout items by row ascending and column ascending.
 */
export const sortLayoutItemsByRowCol = (layout: dashboard.Component[]): dashboard.Component[] => {
  //clone array as sort modifies
  return [...layout].sort(function (a, b) {
    if (a.y > b?.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    } else if (a.y === b.y && a.x === b.x) {
      return 0;
    }
    return -1;
  });
};
