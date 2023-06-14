import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import React, { Children } from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { Link } from "@remix-run/react";
import CloseIcon from "../icons/CloseIcon";
import clsx from "clsx";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";
import { useResizeDetector } from "react-resize-detector";

interface RootProps {
  children: React.ReactNode;
}

const Root = ({ children }: RootProps) => {
  const [showStart, setShowStart] = React.useState(false);
  const [showEnd, setShowEnd] = React.useState(false);

  const { width, ref } = useResizeDetector();

  React.useEffect(() => {
    const onScroll = () => {
      const { scrollWidth = 0, scrollLeft = 0, offsetWidth = 0 } = ref.current || {};
      setShowStart(scrollLeft > 0);
      setShowEnd(scrollLeft + offsetWidth + 10 < scrollWidth);
    };
    onScroll();
    const node = ref.current;

    node?.addEventListener("scroll", onScroll);
    return () => {
      node?.removeEventListener("scroll", onScroll);
      node?.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollRight: React.MouseEventHandler<SVGSVGElement> = (e) => {
    e.stopPropagation();
    const node = ref.current;
    node?.scrollBy({ left: 120, behavior: "smooth" });
  };

  const scrollLeft: React.MouseEventHandler<SVGSVGElement> = (e) => {
    e.stopPropagation();
    const node = ref.current;
    node?.scrollBy({ left: -120, behavior: "smooth" });
  };

  if (width && width > 0 && width < 200 && showEnd) {
    setShowEnd(false);
  }
  return (
    <div className="items-center w-max-full overflow-auto scrollbar-hide relative">
      {showStart && (
        <div className="absolute top-0 left-0 h-12 bg-gradient-to-r from-white to-transparent z-10 dark:from-gray-100">
          <div className="flex h-full w-[100px] justify-start items-center">
            <ChevronLeftIcon
              className="h-5 w-5 m-1 hover:bg-gray-10 rounded pointer hover:border "
              onClick={scrollLeft}
            />
          </div>
        </div>
      )}
      <nav
        className="flex h-12 space-x-1 dark:bg-gray-100 items-center max-w-full overflow-auto scrollbar-hide relative p-1.5 scroll-smooth"
        ref={ref}
      >
        {children}
      </nav>
      {showEnd && (
        <div
          className="absolute top-0 right-0  h-12 bg-gradient-to-l from-white to-transparent z-10 dark:from-gray-100"
          style={{ opacity: showEnd ? 1 : 0 }}
        >
          <div className="flex h-full w-[100px] justify-end items-center">
            <ChevronRightIcon className="h-5 w-5 m-1 hover:bg-gray-10 rounded pointer" onClick={scrollRight} />
          </div>
        </div>
      )}
    </div>
  );
};

interface ReorderTabsProps {
  children: ReactElement<TabsContentProps> | Array<ReactElement<TabsContentProps>>;
  /** this is a callback that returns the new order of item ids */
  reorderItems: (items: string[]) => void;
}

const ReorderTabs = ({ children, reorderItems }: ReorderTabsProps) => {
  // This will iterate through all its children and gather their ids dynamically for the reorder component
  const tabIds = Children.map(children, (child) => child.props.tabId);
  return (
    <Reorder.Group as="ul" axis="x" onReorder={reorderItems} className="flex" values={tabIds}>
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </Reorder.Group>
  );
};

interface TabsContentProps {
  children: React.ReactNode;
  /** thi unique id of the tab */
  tabId: string;
  /** this controls the active/inactive styles of the navigation tab*/
  isActive: boolean;
  /** this is the route that is rendered when clicked */
  to: string;
  /** this is a callback that is called when the close button is clicked */
  onClose?: (value: string) => void;
  /** this is a callback that is called when the tab is clicked */
  onClick?: (value: string) => void;
}

const baseStyles =
  "flex w-[180px] items-center justify-between rounded-md p-1.5 text-xs font-medium overflow-hidden h-9 border";
const activeStyles =
  "border-black-200 bg-white text-black-700 shadow-sm dark:border-gray-70 dark:bg-gray-80 dark:text-white";
const inActiveStyles = "border-transparent text-black-700 hover:text-black-900 dark:text-gray-40";

const ReorderTabContent = ({ children, tabId, isActive, to, onClose, onClick }: TabsContentProps) => {
  const tabContentStyle = clsx(baseStyles, { [activeStyles]: isActive, [inActiveStyles]: !isActive });
  return (
    <Reorder.Item
      value={tabId}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.15 },
      }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      whileDrag={{ scale: 0.95, opacity: 1 }}
      className={tabContentStyle}
    >
      <LinkContent to={to} isActive={isActive} onClose={onClose} onClick={onClick} tabId={tabId}>
        {children}
      </LinkContent>
    </Reorder.Item>
  );
};

const TabContent = ({ children, tabId, isActive, to, onClose, onClick }: TabsContentProps) => {
  const tabContentStyle = clsx(baseStyles, { [activeStyles]: isActive, [inActiveStyles]: !isActive });

  return (
    <div className={tabContentStyle}>
      <LinkContent to={to} isActive={isActive} onClose={onClose} onClick={onClick} tabId={tabId}>
        {children}
      </LinkContent>
    </div>
  );
};

const LinkContent = ({
  children,
  onClose,
  tabId,
  onClick,
  to,
  isActive,
}: Pick<TabsContentProps, "children" | "onClose" | "tabId" | "to" | "onClick" | "isActive">) => {
  const [hoverRef, isHovered] = useHover<HTMLDivElement>();
  return (
    <div className="w-full flex items-center" ref={hoverRef}>
      <Link
        to={to}
        className="flex items-center overflow-hidden w-full"
        prefetch="intent"
        onMouseDown={(e) => {
          e.preventDefault();
          onClick && onClick(tabId);
        }}
      >
        {children}
      </Link>
      {onClose && (
        <motion.button
          onPointerDown={(event) => {
            event.stopPropagation();
            onClose(tabId);
          }}
          initial={false}
          animate={{ opacity: isHovered || isActive ? 1 : 0 }}
          aria-label="close-tab-button"
        >
          <CloseIcon className="ml-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-20" />
        </motion.button>
      )}
    </div>
  );
};

export { Root, TabContent, ReorderTabs, ReorderTabContent };

//This is a simple hook that returns a ref and a boolean value that is true when the ref is hovered
function useHover<T extends HTMLElement>() {
  const [value, setValue] = useState(false);
  const ref = useRef<T>(null);
  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);
  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mouseover", handleMouseOver);
      node.addEventListener("mouseout", handleMouseOut);
      return () => {
        node.removeEventListener("mouseover", handleMouseOver);
        node.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, [ref]);
  return [ref, value] as const;
}
