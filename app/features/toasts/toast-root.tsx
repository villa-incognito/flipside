import * as Toast from "@radix-ui/react-toast";
import { CheckCircleIcon, CloseIcon, InformationIcon, WarningTriangleIcon } from "@fscrypto/ui";
import { ToasterState } from "./machines";
import type { ToastActorRef } from "./machines/toasts-machine";
import { useActor } from "@xstate/react";
import clsx from "clsx";

/**
 * This is the component that wraps all the toast components together. It contains the toast viewport
 * which enables the the toast items to be rendered. When an item is added to the toast state the
 * Toast root will loops through the toast items and add them to the viewport */
export const ToastRoot = () => {
  const [state] = ToasterState.useToaster();
  const { toasts } = state.context;

  return (
    <Toast.Provider>
      {toasts.map((notif, index) => (
        <Toast.Root
          className="data-[state=closed]:animate-[fadeout_150ms_ease-in-out] data-[state=open]:animate-[fadein_100ms_ease-in-out]"
          onOpenChange={(open) => {
            if (!open) {
              if (!notif.getSnapshot()?.done) notif.send({ type: "DISMISS" });
            }
          }}
          duration={notif.getSnapshot()?.context.timeout || 5000}
          key={index}
        >
          <ToastItem notification={notif} />
        </Toast.Root>
      ))}
      {/* this determines the position of the toast container */}
      <Toast.Viewport className="fixed right-8 top-8 z-20 flex flex-col" />
    </Toast.Provider>
  );
};

/** This contains the markup, animation and styles for the individual Toast items */
const ToastItem = ({ notification }: ToastItemProps) => {
  const [state] = useActor(notification);
  const { type, title, description, preventClose, ActionComponent, actionStyle } = state.context;
  if (state.matches("inactive")) {
    return null;
  }

  return (
    <div className="dark:bg-gray-80 mt-4 w-96 items-start justify-between rounded-md border bg-white p-4 shadow-lg dark:border-gray-700">
      <div className="flex">
        <div>
          {type === "info" ? (
            <InformationIcon className="h-6 w-6 text-blue-50" />
          ) : type === "success" ? (
            <CheckCircleIcon className="text-green-60 h-6 w-6" />
          ) : type === "warning" ? (
            <WarningTriangleIcon className="text-orange-60 h-6 w-6" />
          ) : type === "error" ? (
            <WarningTriangleIcon className="text-red-60 h-6 w-6" />
          ) : (
            <div>...</div>
          )}
        </div>
        <div className="grow pl-2 pr-4 text-sm">
          <Toast.Title className="dark:text-gray-10 font-medium">{title}</Toast.Title>
          {description && (
            <Toast.Description className="text-gray-60 dark:text-gray-40">{description}</Toast.Description>
          )}
        </div>
        {!preventClose && (
          <div className="flex h-10 items-center">
            <Toast.Close>
              <CloseIcon className="dark:text-gray-40 h-5 w-5 cursor-pointer opacity-90 transition hover:opacity-100" />
            </Toast.Close>
          </div>
        )}
      </div>
      {ActionComponent && (
        <div className={clsx(actionStyle)}>
          <Toast.Action altText="confirm">
            <ActionComponent />
          </Toast.Action>
        </div>
      )}
    </div>
  );
};

interface ToastItemProps {
  notification: ToastActorRef;
}

export interface Notification {
  type: ToastType;
  title: string;
  description?: string;
  timeout?: number;
  preventClose?: boolean;
  ActionComponent?: React.FC;
  actionStyle?: string;
}

type ToastType = "success" | "warning" | "error" | "info";
