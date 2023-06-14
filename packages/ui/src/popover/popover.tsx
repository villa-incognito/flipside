import React, { createContext } from "react";
import type { PopoverContentProps, PopoverProps } from "@radix-ui/react-popover";
import { Root as PopoverRoot, Trigger, Close } from "@radix-ui/react-popover";
import * as Popover from "@radix-ui/react-popover";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import type { Variants } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

/* -------------------------------------------------------------------------------------------------
 * Root
 * -------------------------------------------------------------------------------------------------
 * This is mainly a wrapper around the 'react-popover' Root primitive with additional context.
 * The Root component does not need ref forwarding
 */

const CustomContext = createContext<{ onOpenChange?: (open: boolean) => void; open: boolean }>({ open: false });

const Root = (props: PopoverProps) => {
  // In order to simplify the consuming api we can use context here to allow the content access to the root state. This is required for framer motion to determine if the content should mount/unmount
  const { open: openProp, onOpenChange, defaultOpen } = props;
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <CustomContext.Provider value={React.useMemo(() => ({ onOpenChange: setOpen, open }), [setOpen, open])}>
      <PopoverRoot {...props} open={open} onOpenChange={setOpen} />
    </CustomContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Content
 * -------------------------------------------------------------------------------------------------
 * This is mainly a wrapper around the 'react-popover' Content primitive with some custom styling and animation.
 * The portal props are using the defaults are unlikely to be used. Until then we can simplify the api
 * by using it here and not exposing it in the UI package.
 *
 * The ref prop is forwarded to the content component
 */

interface PopoverContentPropsCustom extends PopoverContentProps {
  overrideClickToClose?: boolean;
}

/** These are the default styles  */
const defaultContentStyle = "rounded border shadow-lg bg-white dark:bg-gray-90 dark:text-gray-70 dark:border-gray-70";
type PopoverContentElement = React.ElementRef<typeof Popover.Content>;

const Content = React.forwardRef<PopoverContentElement, PopoverContentPropsCustom>(function PopoverContent(
  props: PopoverContentPropsCustom,
  forwardedRef
) {
  // Use the context value from the root to determine if the content should mount/unmount
  const { open, onOpenChange } = React.useContext(CustomContext);

  const { className, children, ...rest } = props;

  const contentSide = props.side ?? "bottom";
  const overrideClickToClose = props.overrideClickToClose ?? false;

  return (
    <AnimatePresence>
      {open ? (
        // although we are exporting as the Content component it will contain the Portal component under the hood to avoid repetition
        <Popover.Portal forceMount>
          <Popover.Content
            {...rest}
            ref={forwardedRef}
            className={clsx(defaultContentStyle, className)}
            asChild
            style={{ zIndex: 1000 }}
          >
            <motion.div
              initial={"closed"}
              animate={"open"}
              exit={"closed"}
              variants={variants[contentSide]}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              onClick={() => onOpenChange && !overrideClickToClose && onOpenChange(false)}
            >
              {children}
              {/* <Arrow /> */}
            </motion.div>
          </Popover.Content>
        </Popover.Portal>
      ) : null}
    </AnimatePresence>
  );
});

type NoUndefined<T> = T extends undefined ? never : T;

//The variants are for the slight differences in animation for each side
const variants: Record<NoUndefined<PopoverContentProps["side"]>, Variants> = {
  bottom: {
    open: { opacity: 1, translateY: 0 },
    closed: { opacity: 0, translateY: -3 },
  },
  top: {
    open: { opacity: 1, translateY: 0 },
    closed: { opacity: 0, translateY: 3 },
  },
  left: {
    open: { opacity: 1, translateX: 0 },
    closed: { opacity: 0, translateX: 3 },
  },
  right: {
    open: { opacity: 1, translateX: 0 },
    closed: { opacity: 0, translateX: -3 },
  },
};

export { Root, Content, Trigger, Close };
