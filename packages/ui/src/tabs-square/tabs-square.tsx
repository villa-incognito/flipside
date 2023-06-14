import clsx from "clsx";
import { AnimatePresence, Reorder } from "framer-motion";
import type { ReactElement } from "react";
import { Children } from "react";

interface RootProps {
  children: ReactElement<TabProps> | Array<ReactElement<TabProps>>;
  /** this is a callback that returns the new order of item ids */
  reorderItems?: (items: string[]) => void;
  rightSlot?: React.ReactNode;
  disableDrag?: boolean;
}

const Root = ({ children, reorderItems, rightSlot, disableDrag }: RootProps) => {
  const tabIds = Children.map(children, (child) => child?.props?.tabId);
  return (
    <nav className="flex h-12 items-center max-w-full overflow-auto scrollbar-hide relative p-1.5 scroll-smooth w-full">
      {disableDrag ? (
        <ul className="flex gap-x-2">{children}</ul>
      ) : (
        <AnimatePresence initial={false}>
          <Reorder.Group
            as="ul"
            axis="x"
            onReorder={(items) => reorderItems?.(items)}
            className="flex gap-x-2"
            values={tabIds}
          >
            <AnimatePresence initial={false}>{children}</AnimatePresence>
          </Reorder.Group>
        </AnimatePresence>
      )}
      {rightSlot}
    </nav>
  );
};

interface TabProps {
  children: React.ReactNode;
  /** this is a unique id of the tab */
  tabId: string;
  /** this controls the active/inactive styles of the navigation tab*/
  isActive: boolean;
  /** this is a callback that is called when the tab is clicked */
  onClick?: (value: string) => void;
  disableDrag?: boolean;
}

const baseStyles =
  "flex min-w-[180px] items-center justify-between rounded-lg p-1.5 text-xs font-medium overflow-hidden dark:text-white h-9 cursor-pointer";
const activeStyles =
  "border border-black-200 bg-white text-black-700 shadow-sm dark:border-gray-70 dark:bg-gray-80 dark:text-white";
const inActiveStyles = "text-gray-50 hover:text-black-900 dark:text-gray-30 dark:bg-gray-90 bg-gray-10";

const Tab = ({ children, tabId, isActive, onClick, disableDrag }: TabProps) => {
  const tabContentStyle = clsx(baseStyles, { [activeStyles]: isActive, [inActiveStyles]: !isActive });
  if (disableDrag)
    return (
      <li key={tabId} onClick={() => onClick?.(tabId)} className={tabContentStyle}>
        {children}
      </li>
    );

  return (
    <Reorder.Item
      key={tabId}
      onClick={() => onClick?.(tabId)}
      value={tabId}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.15 },
      }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      whileDrag={{ opacity: 1 }}
      className={tabContentStyle}
    >
      {children}
    </Reorder.Item>
  );
};

export { Root, Tab };
