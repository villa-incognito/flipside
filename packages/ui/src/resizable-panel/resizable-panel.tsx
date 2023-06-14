import React from "react";
import clsx from "clsx";
import Split from "react-split";

interface ResizablePanelProps {
  direction?: "horizontal" | "vertical";
  className?: string;
  sizes?: [number, number];
  maxSizes?: [number, number];
  minSize?: number;
  onDrag?: (sizes: [number, number]) => void;
  onDragEnd?: (sizes: [number, number]) => void;
  snapOffset?: number;
  gutterSize?: number;
}
export const ResizablePanel = ({
  children,
  direction = "horizontal",
  sizes,
  maxSizes,
  minSize,
  className,
  onDrag,
  onDragEnd,
  snapOffset,
  gutterSize,
}: React.PropsWithChildren<ResizablePanelProps>) => {
  const styles = clsx(
    "w-full h-full split bg-gray-10 dark:bg-gray-100 overflow-hidden max-w-full max-h-full flex",
    { "flex-col": direction === "vertical" },
    className
  );
  return (
    <Split
      direction={direction}
      gutterSize={gutterSize ?? 4}
      className={styles}
      sizes={sizes}
      maxSize={maxSizes}
      minSize={minSize}
      onDrag={onDrag}
      snapOffset={snapOffset ?? 150}
      onDragEnd={onDragEnd}
    >
      {children}
    </Split>
  );
};
