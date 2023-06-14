import type { ReactNode } from "react";
import { useEffect } from "react";
import React, { useState } from "react";
import * as ConfirmDialog from "@radix-ui/react-alert-dialog";
import { Button } from "../button";
import { AnimatePresence, motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";

/* -----------------------------------------------------------------------------------------------
 * ConfirmDialog
-------------------------------------------------------------------------------------------------*/

interface ConfirmDialogProps {
  /** optional slot to trigger dialog */
  children: React.ReactNode;
  confirmMessage?: string;
  description?: string;
  title: string;
  /** this is only triggered when the confirm button is clicked. */
  onConfirm: () => void;
  /** Triggered when the cancel button is clicked */
  onCancel?: () => void;
  /** If provided, parent controls the open state */
  open?: boolean;
}

/**
 * This is a simple alert dialog that is rendered when a user needs to confirm that the activity they chose is correct.
 * The dialog interrupts the user with important content and expects a response. Once confirmed the onConfirm callback is triggered.
 */

const Root = React.forwardRef<HTMLDivElement, ConfirmDialogProps>(function Root(
  props: ConfirmDialogProps,
  forwardedRef
) {
  const { children, confirmMessage, description, title, onConfirm, ...rest } = props;
  const [controlled] = useState(props.open !== undefined);
  const [isOpen, setIsOpen] = useOpenState(props.open ?? false, controlled);
  return (
    <ConfirmDialog.Root onOpenChange={(open) => !controlled && setIsOpen(open)}>
      {children && forwardedRef && (
        <ConfirmDialog.Trigger asChild>
          {/* this allows the asChild prop to be used on the ConfirmDialog component and will instead be forwarded to the child elements used. */}
          <div onClick={(e) => e.stopPropagation()}>
            <Slot {...rest}>{children}</Slot>
          </div>
        </ConfirmDialog.Trigger>
      )}
      <AnimatedOverlay isOpen={isOpen}>
        <ConfirmDialog.Title className="font-semibold dark:text-white text-gray-90 text-sm w-full">
          {title}
        </ConfirmDialog.Title>
        {description && (
          <ConfirmDialog.Description className="text-gray-60 w-full text-sm mt-4">
            {description}
          </ConfirmDialog.Description>
        )}
        <div className="flex justify-end space-x-2 mt-8 w-full">
          <ConfirmDialog.Cancel
            asChild
            onClick={(e) => {
              e.stopPropagation();
              props.onCancel?.();
            }}
          >
            <Button variant="secondary" size="sm">
              Cancel
            </Button>
          </ConfirmDialog.Cancel>
          <ConfirmDialog.Action
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
          >
            <Button variant="warning" size="sm">
              {confirmMessage ?? "Confirm"}
            </Button>
          </ConfirmDialog.Action>
        </div>
      </AnimatedOverlay>
    </ConfirmDialog.Root>
  );
});

export default Root;

/** This uses framer motion to add some animation to the dialog entry and exit */
const AnimatedOverlay = ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <ConfirmDialog.Portal forceMount id="alert-dialog-portal" key="alert-dialog-portal">
        <ConfirmDialog.Overlay
          className="fixed z-10 inset-0 overflow-y-auto bg-gray-900 dark:bg-gray-400"
          key="alert-dialog-overlay"
          asChild
        >
          <motion.div
            key="alert-overlay"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: { opacity: 0.3 },
              closed: { opacity: 0, transition: { delay: 0.1 } },
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
        </ConfirmDialog.Overlay>
        <ConfirmDialog.Content key="alert-dialog-content">
          <div className="fixed top-0 left-0, z-[11] w-screen flex items-center justify-center h-screen">
            <motion.div
              key="alert-dialog"
              className="border bg-white dark:bg-gray-90 dark:border-gray-100 rounded-lg p-4 w-1/4 flex-grow-0  shadow"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { opacity: 1, y: 0, transition: { delay: 0.1 } },
                closed: { opacity: 0, y: "20px" },
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </div>
        </ConfirmDialog.Content>
      </ConfirmDialog.Portal>
    )}
  </AnimatePresence>
);

function useOpenState(open: boolean, controlled?: boolean) {
  const [isOpen, _setIsOpen] = useState(open);
  useEffect(() => {
    if (controlled) {
      _setIsOpen(open);
    }
  }, [open, controlled]);

  const setIsOpen = (open: boolean) => {
    if (controlled) return;
    _setIsOpen(open);
  };

  return [isOpen, setIsOpen] as const;
}
