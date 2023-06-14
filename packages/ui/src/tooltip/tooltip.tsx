import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

type Side = "top" | "right" | "bottom" | "left";

function TooltipContent({ side, children }: { side: Side; children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={5}
        className="bg-gray-80 text-white py-1 rounded-lg text-sm px-2 z-50"
        onPointerDownOutside={(e) => e.preventDefault()}
        side={side}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-gray-80" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

const Provider = TooltipPrimitive.Provider;
const Root = TooltipPrimitive.Root;
const Trigger = TooltipPrimitive.Trigger;
const Content = TooltipContent;

type TooltipProps = {
  content?: React.ReactNode;
  contentFn?: () => React.ReactNode;
  side: Side;
  children: React.ReactNode;
  display?: boolean;
};

export const Tooltip = ({ content, side, children, contentFn, display = true }: TooltipProps) => {
  const renderContent = contentFn ? contentFn() : content || "";

  if (!display) {
    return <>{children}</>;
  }
  return (
    <Provider delayDuration={500}>
      <Root>
        <Trigger asChild>{children}</Trigger>
        <Content side={side}>{renderContent}</Content>
      </Root>
    </Provider>
  );
};
