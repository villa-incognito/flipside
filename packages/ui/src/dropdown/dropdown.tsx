import React, { createContext } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Root as DropdownRoot, Trigger, Sub, Portal, SubTrigger, SubContent } from "@radix-ui/react-dropdown-menu";
import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuLabelProps,
  DropdownMenuProps,
} from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useControllableState } from "@radix-ui/react-use-controllable-state";

/* -------------------------------------------------------------------------------------------------
 * Root
 * -------------------------------------------------------------------------------------------------
 * This is mainly a wrapper around the 'react-dropdown-menu' Root primitive with additional context.
 * The Root component does not need ref forwarding
 */

const CustomContext = createContext<{ onOpenChange?: (open: boolean) => void; open: boolean }>({ open: false });
const Root = (props: DropdownMenuProps) => {
  // In order to simplify the consuming api we can use context here to allow the content access to the root state. This is required for framer motion to determine if the content should mount/unmount
  // https://github.com/radix-ui/primitives/issues/1281
  const { open: openProp, onOpenChange, defaultOpen } = props;
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <CustomContext.Provider value={React.useMemo(() => ({ onOpenChange: setOpen, open }), [setOpen, open])}>
      <DropdownRoot {...props} open={open} onOpenChange={setOpen} />
    </CustomContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Content
 * -------------------------------------------------------------------------------------------------
 * This is mainly a wrapper around the 'react-dropdown-menu' Content primitive with some custom styling and animation.
 * The portal props are using the defaults are unlikely to be used. Until then we can simplify the api
 * by using it here and not exposing it in the UI package.
 *
 * The ref prop is forwarded to the content component
 */

/** These are the default styles  */
const defaultContentStyle = "rounded border shadow bg-white w-44 dark:bg-gray-90 dark:text-gray-70 dark:border-gray-70";
type DropdownMenuContentElement = React.ElementRef<typeof DropdownMenuPrimitive.Content>;

const Content = React.forwardRef<DropdownMenuContentElement, DropdownMenuContentProps>(function DropdownMenuContent(
  props: DropdownMenuContentProps,
  forwardedRef
) {
  // Use the context value from the root to determine if the content should mount/unmount
  const { open } = React.useContext(CustomContext);

  const { className, children, ...rest } = props;

  return (
    <AnimatePresence>
      {open ? (
        // although we are exporting as the Content component it will contain the Portal component under the hood to avoid repetition
        <DropdownMenuPrimitive.Portal forceMount>
          <DropdownMenuPrimitive.Content
            {...rest}
            ref={forwardedRef}
            className={clsx(defaultContentStyle, className)}
            asChild
          >
            <motion.div
              initial={{ opacity: 0.2, translateY: -3 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -3 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Item
 * -------------------------------------------------------------------------------------------------
 * This is a simple wrapper around the 'react-dropdown-menu' item primitive with some custom styling.
 */

/** These are the default styles  */
const defaultItemStyle =
  "rounded flex items-center h-7 m-1 px-2 py-1.5 text-xs select-none hover text-gray-600 focus:ring-0 focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none cursor-pointer radix-highlighted:bg-gray-10 radix-disabled:text-gray-300 dark:text-gray-10 radix-highlighted:dark:bg-gray-80 dark:radix-disabled:text-gray-70";
type DropdownMenuItemElement = React.ElementRef<typeof DropdownMenuPrimitive.Item>;

const Item = React.forwardRef<DropdownMenuItemElement, DropdownMenuItemProps>(function DropdownMenuItem(
  props: DropdownMenuItemProps,
  forwardedRef
) {
  const { className, ...rest } = props;

  return <DropdownMenuPrimitive.Item {...rest} ref={forwardedRef} className={clsx(defaultItemStyle, className)} />;
});

/* -------------------------------------------------------------------------------------------------
 * Separator
 * -------------------------------------------------------------------------------------------------
 * This is a simple styled separator
 */

const defaultSeparatorStyle = "h-[1px] bg-gray-200 mx-1 dark:bg-gray-70";
type DropdownMenuSeparatorElement = React.ElementRef<typeof DropdownMenuPrimitive.Separator>;

const Separator = React.forwardRef<DropdownMenuSeparatorElement, DropdownMenuSeparatorProps>(
  function DropdownMenuSeparator(props: DropdownMenuSeparatorProps, forwardedRef) {
    const { className, ...rest } = props;

    return (
      <DropdownMenuPrimitive.Separator
        {...rest}
        ref={forwardedRef}
        className={clsx(defaultSeparatorStyle, className)}
      />
    );
  }
);

/* -------------------------------------------------------------------------------------------------
 * Label
 * -------------------------------------------------------------------------------------------------
 * This is a simple styled Label
 */

const defaultLabelStyle = "text-gray-400 text-xs pt-2 pb-1 px-3";
type DropdownMenuLabelElement = React.ElementRef<typeof DropdownMenuPrimitive.Label>;

const Label = React.forwardRef<DropdownMenuLabelElement, DropdownMenuLabelProps>(function DropdownMenuLabel(
  props: DropdownMenuLabelProps,
  forwardedRef
) {
  const { className, ...rest } = props;

  return <DropdownMenuPrimitive.Label {...rest} ref={forwardedRef} className={clsx(defaultLabelStyle, className)} />;
});

export { Root, Trigger, Content, Item, Separator, Label, Sub, Portal, SubTrigger, SubContent };
