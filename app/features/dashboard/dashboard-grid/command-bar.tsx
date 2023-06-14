import type { dashboard } from "@fscrypto/domain";
import { HeadingIcon, Icon, PhotoIcon, PieChartIcon, TableRowsIcon, TextIcon } from "@fscrypto/ui";
import type { DragEvent } from "react";
import type ReactGridLayout from "react-grid-layout";
import { startCase } from "lodash";
import { tracking } from "~/utils/tracking";
import type { AddCellToDashboardArgs } from "./dashboard-grid-layout";
import { useDashboardPanelDragType } from "../util/dashboardDragType";
import { getDefaultPanelXYHW } from "../util/default-panel-dimensions";

export const CommandBar = ({
  layout,
  onAddCellClick,
}: {
  layout: ReactGridLayout.Layout[];
  onAddCellClick: (cell: AddCellToDashboardArgs) => void;
}) => {
  return (
    <div className="fixed bottom-8 left-0 right-0 z-20 mx-auto hidden w-[400px] md:block">
      <div className=" bg-gray-10 dark:border-gray-80 flex justify-between space-x-6 rounded-lg border px-6 py-4 shadow-lg dark:bg-gray-100">
        <CommandBarItem Icon={PieChartIcon} type="chart" layout={layout} onAddCellClick={onAddCellClick} />
        <CommandBarItem Icon={TableRowsIcon} type="table" layout={layout} onAddCellClick={onAddCellClick} />
        <CommandBarItem Icon={HeadingIcon} type="heading" layout={layout} onAddCellClick={onAddCellClick} />
        <CommandBarItem Icon={TextIcon} type="text" layout={layout} onAddCellClick={onAddCellClick} />
        <CommandBarItem Icon={PhotoIcon} type="image" layout={layout} onAddCellClick={onAddCellClick} />
      </div>
    </div>
  );
};

type DragType = "chart" | "text" | "heading" | "image" | "table";

interface CommandBarItemProps {
  Icon: Icon;
  type: DragType;
  layout?: ReactGridLayout.Layout[] | undefined;
  onAddCellClick: (cell: AddCellToDashboardArgs) => void;
}
export const CommandBarItem = ({ Icon, type, layout, onAddCellClick }: CommandBarItemProps) => {
  const [, setItem] = useDashboardPanelDragType();
  const onDragStart = (e: DragEvent) => {
    const componentType = typeMapper[type].type;
    setItem(componentType);
    e.stopPropagation();
    e.dataTransfer.setData("dashboard-drag", JSON.stringify(typeMapper[type]));
    tracking(`add_cell_drag_${type.toLowerCase()}`, "Dashboard Editor");
  };
  return (
    <div
      className={"flex cursor-grab flex-col items-center justify-center"}
      onClick={() => {
        const { type: addType, ...rest } = typeMapper[type] as dashboard.Cell["formula"] & {
          type: dashboard.ComponentType;
        };
        if (layout) {
          onAddCellClick({
            type: addType,
            position: getDefaultPanelXYHW(addType),
            formula: rest,
            layout,
          });
          tracking(`add_cell_click_${addType.toLowerCase()}`, "Dashboard Editor");
        }
      }}
    >
      <div
        draggable={true}
        className="dark:bg-gray-90 mb-2 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-md"
        onDragStart={onDragStart}
      >
        <Icon className="text-gray-80 h-8 w-8 dark:text-gray-50" />
      </div>
      <span className="text-gray-40 text-sm">{startCase(type)}</span>
    </div>
  );
};

export const defaultTextPanelValue =
  "Add text here. <a href='https://docs.flipsidecrypto.com/our-app/markdown-reference' target='_blank'>Markdown</a> formatting is supported.";

const typeMapper: Record<DragType, dashboard.Cell["formula"] & { type: dashboard.ComponentType }> = {
  heading: { type: "Heading", text: "Add heading here" },
  text: {
    type: "Text",
    text: defaultTextPanelValue,
  },
  image: { type: "Image", imageName: "" },
  chart: { type: "QueryVisual", visId: "" },
  table: { type: "QueryTable", queryId: "" },
};
