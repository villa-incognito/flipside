import React, { createContext, useContext } from "react";
import { Root as CollapsibleRoot, CollapsibleContent, Trigger } from "@radix-ui/react-collapsible";
import type { CollapsibleContentProps, CollapsibleProps } from "@radix-ui/react-collapsible";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------------------------------------------------------------------------------------
 * Root
 * -------------------------------------------------------------------------------------------------
 * This is mainly a wrapper around the 'react-react-collapsible Root primitive with additional context.
 * The Root component does not need ref forwarding
 */

const CustomContext = createContext<{ onOpenChange?: (open: boolean) => void; open: boolean }>({ open: false });
const Root = (props: CollapsibleProps) => {
  //This is required for framer motion to determine if the content should mount/unmount
  const { open: openProp, onOpenChange, defaultOpen } = props;
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <CustomContext.Provider value={React.useMemo(() => ({ onOpenChange: setOpen, open }), [setOpen, open])}>
      <CollapsibleRoot {...props} open={open} onOpenChange={setOpen} />
    </CustomContext.Provider>
  );
};
export const useCollapsibleState = () => {
  const { open, onOpenChange } = useContext(CustomContext);
  return { open, onOpenChange };
};

/* -------------------------------------------------------------------------------------------------
 * Content
 * -------------------------------------------------------------------------------------------------
 * This is a wrapper around the 'react-collapsible' Content primitive with some animation.
 *
 * The ref prop is forwarded to the animated div component
 */

type CollapsibleContentElement = React.ElementRef<typeof CollapsibleContent>;
type CustomCollapsibleContentProps = CollapsibleContentProps & { staggeredList?: boolean };
const Content = React.forwardRef<CollapsibleContentElement, CustomCollapsibleContentProps>(function Content(
  props: CustomCollapsibleContentProps,
  forwardedRef
) {
  // Use the context value from the root to determine if the content should mount/unmount
  const { open } = React.useContext(CustomContext);

  const { staggeredList, children, ...rest } = props;

  return (
    <AnimatePresence>
      {open ? (
        <CollapsibleContent {...rest} asChild forceMount>
          <motion.div
            ref={forwardedRef}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            // style={{ overflow: "hidden" }}
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {staggeredList ? <StaggeredList>{children}</StaggeredList> : children}
          </motion.div>
        </CollapsibleContent>
      ) : null}
    </AnimatePresence>
  );
});

/* -------------------------------------------------------------------------------------------------
 * StaggeredList
 * -------------------------------------------------------------------------------------------------
 * This component will add a staggered animation to the children of the content component.
 */

const listItem = {
  hidden: { opacity: 0.3, translateX: 30 },
  show: { opacity: 1, translateX: 0 },
};

export const StaggeredList = ({ children }: { children: React.ReactNode }) => {
  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length < 1) {
    return null;
  }
  const container = {
    hidden: { opacity: 0.4 },
    show: {
      opacity: 1,
      transition: {
        ease: "easeInOut",
        staggerChildren: 0.2 / childrenArray.length,
      },
    },
  };
  return (
    <motion.ul variants={container} initial="hidden" animate="show">
      {React.Children.map(children, (child, i) => (
        <motion.li key={i} variants={listItem}>
          {child}
        </motion.li>
      ))}
    </motion.ul>
  );
};

export { Root, Content, Trigger };
