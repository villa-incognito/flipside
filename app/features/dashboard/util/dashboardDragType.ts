import { dashboard } from "@fscrypto/domain";
import { atom, useAtom } from "jotai";

const dashboardPanelDragType = atom<dashboard.ComponentType | null>(null);

export const useDashboardPanelDragType = () => {
  return useAtom(dashboardPanelDragType);
};
