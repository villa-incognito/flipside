import { ChevronDownIcon, ChevronUpIcon } from "../icons";
import { Listbox } from "@headlessui/react";
import clsx from "clsx";

interface TextSelectorProps<T extends string | undefined> {
  options: { label: string; value: T }[];
  value?: T;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: T) => void;
  className?: string;
}
export const TextSelector = <T extends string | undefined>({
  onChange,
  options,
  value,
  placeholder,
  disabled = false,
  className,
}: TextSelectorProps<T>) => {
  const selected = options.find((d) => d.value === value);
  return (
    <div className={clsx("max-w-[240px] text-sm", className)}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="dark:text-gray-30 relative">
          <Listbox.Button
            aria-label="input-title"
            className="hover:bg-gray-15 dark:hover:bg-gray-80 flex items-center gap-x-2  rounded-md px-2 py-1"
            disabled={disabled}
          >
            {(props) => (
              <>
                <span aria-label="text-selector-label" className={!selected?.label ? "text-gray-50" : ""}>
                  {selected?.label ?? placeholder}
                </span>
                {!props.open ? (
                  <ChevronDownIcon className="h-4 w-4 " aria-hidden="true" />
                ) : (
                  <ChevronUpIcon className="h-4 w-4 " aria-hidden="true" />
                )}
              </>
            )}
          </Listbox.Button>
          <Listbox.Options className="border-gray-15 dark:border-gray-80 absolute z-10 flex w-full flex-col truncate rounded-md shadow-md">
            {options.map(({ label, value }, personIdx) => (
              <Listbox.Option
                key={personIdx}
                value={value}
                className="hover:bg-gray-15 dark:hover:bg-gray-60 dark:bg-gray-80 bg-white p-2"
              >
                <span>{label}</span>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};
