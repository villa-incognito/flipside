import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";

interface ModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export default function Modal({ open, setOpen, children, className }: ModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-30"
        onClose={setOpen}
        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="bg-opacity-80 opacity-80"
          leave="ease-in duration-200"
          leaveFrom="bg-opacity-80 opacity-80"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-80 bg-opacity-60 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  className,
                  "border bg-white dark:bg-gray-90 dark:border-gray-100 rounded-lg w-full flex-grow-0 shadow relative transform overflow-hidden transition-all sm:my-8 sm:w-full sm:max-w-2xl"
                )}
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
