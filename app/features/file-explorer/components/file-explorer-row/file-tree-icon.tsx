import type { visualization } from "@fscrypto/domain";
import { WorkItemType } from "@fscrypto/domain/src/work-item";
import {
  AreaChartIcon,
  BarChartFilledIcon,
  BrowserIcon,
  ChartIcon,
  CodeIcon,
  FolderIcon,
  FolderOpenIcon,
  GridMasonryIcon,
  LineChartIcon,
  PieChartFilledIcon,
  ScatterChartIcon,
  ScorecardIcon,
} from "@fscrypto/ui";
import clsx from "clsx";

interface FileTreeIconProps {
  type: WorkItemType;
  size?: "sm" | "md";
  active?: boolean;
  visType?: visualization.VisualizationType;
  grayScale?: boolean;
}

/*
 * This is a simple component that determines which icon to render depending on the `type` and it's `active` state
 */
export const FileTreeIcon = ({ type, active, visType, size = "md" }: FileTreeIconProps) => {
  switch (true) {
    case type === "collection" && active:
      return (
        <FolderOpenIcon
          className={clsx("mr-1 flex-shrink-0 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white", {
            "h-4 w-4": size === "sm",
            "h-5 w-5": size === "md",
          })}
        />
      );
    case type === "collection" && !active:
      return (
        <FolderIcon
          className={clsx("mr-1 flex-shrink-0 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white", {
            "h-4 w-4": size === "sm",
            "h-5 w-5": size === "md",
          })}
        />
      );
    case type === "query":
      return (
        <CodeIcon
          className={clsx("text-orange-60 group-hover:text-orange-60 mr-1 flex-shrink-0", {
            "h-4 w-4": size === "sm",
            "h-5 w-5": size === "md",
          })}
        />
      );
    case type === "dashboard":
      return (
        <GridMasonryIcon
          className={clsx("text-green-60  group-hover:text-green-60 mr-1 flex-shrink-0", {
            "h-4 w-4": size === "sm",
            "h-5 w-5": size === "md",
          })}
        />
      );
    case type === "table":
      return <BrowserIcon className="text-blue-60 group-hover:text-blue-60 mr-1 h-5 w-5 flex-shrink-0" />;
    case type === "visualization":
      return <VisualizationIcon type={visType} size={size} />;
    default:
      return null;
  }
};

export const VisualizationIcon = ({
  type,
  size = "md",
}: {
  type?: visualization.VisualizationType;
  size: "sm" | "md";
}) => {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const classes = `mr-1 flex-shrink-0 ${sizeClass}`;
  switch (true) {
    case type === "bar":
      return <BarChartFilledIcon className={classes} />;
    case type === "line":
      return <LineChartIcon className={classes} />;
    case type === "scatter":
      return <ScatterChartIcon className={classes} />;
    case type === "bar_line":
      return <BarChartFilledIcon className={classes} />;
    case type === "area":
      return <AreaChartIcon className={classes} />;
    case type === "donut":
      return <PieChartFilledIcon className={classes} />;
    case type === "big_number":
      return <ScorecardIcon className={classes} />;
    default:
      return <ChartIcon className={classes} />;
  }
};
