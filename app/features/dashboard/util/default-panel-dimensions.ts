import { dashboard } from "@fscrypto/domain";

export const getDefaultPanelXYHW = (
  type: dashboard.ComponentType
): Pick<ReactGridLayout.Layout, "x" | "y" | "w" | "h"> => {
  // set default y to 1000 so it will be placed at the bottom
  if (type === "Heading") {
    return { y: 1000, x: 0, h: 1, w: 12 };
  } else {
    return { y: 1000, x: 0, h: 4, w: 6 };
  }
};

export const getDefaultPanelHW = (type: dashboard.ComponentType | null): Pick<ReactGridLayout.Layout, "w" | "h"> => {
  if (type === "Heading") {
    return { h: 1, w: 12 };
  } else {
    return { h: 4, w: 6 };
  }
};
