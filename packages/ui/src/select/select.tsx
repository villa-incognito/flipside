import * as SelectPrimitive from "@radix-ui/react-select";
import clsx from "clsx";
import { ChevronDownIcon } from "../icons";

type Size = "sm" | "md" | "lg";

interface SelectProps<T> {
  /** The options to display in the dropdown */
  options: T[];
  /** A function to get the display name for the option */
  getOptionName: (v?: T) => string;
  /** A function to get the value for the option */
  getOptionValue: (v?: T) => string;
  /** A function to get the value for the option */
  getOptionIcon?: (v?: T) => React.ReactNode;
  /** A function to call when the selected option changes */
  onChange: (v: T) => void;
  /** Current value of the dropdown */
  value?: T;
  /** Disable the input */
  disabled?: boolean;
  /** Name for the select element */
  name?: string;
  /** Placeholder for the select element */
  placeholder?: string;
  /** Size of the dropdown */
  size?: Size;
  /** Whether or not there's an error for this input */
  error?: boolean;
}

const textStyles = "dark:text-gray-10";
const baseStyles = "border rounded-lg text-[14px] outline-none focus:!border-blue-50 w-full text-left bg-white";
const darkStyles = "dark:border-gray-70 dark:bg-gray-90";
const smStyles = "px-3 py-1";
const mdStyles = "px-4 py-2";
const lgStyles = "px-4 py-3";
const errorStyles = "!border-red-50 focus:!border-red-50";
const disabledStyles = "text-gray-30 bg-gray-10 dark:!text-gray-60 dark:!bg-gray-80";
const sizeStyles: Record<Size, string> = {
  sm: smStyles,
  md: mdStyles,
  lg: lgStyles,
};
const baseContentStyles = "overflow-hidden rounded-md shadow-md bg-white z-30";
const baseItemStyles =
  "w-full outline-none px-4 py-2 hover:bg-gray-10 dark:hover:bg-gray-100 text-[14px] cursor-pointer";

export const Select = <T,>({
  name,
  placeholder,
  options,
  getOptionName,
  getOptionValue,
  getOptionIcon,
  onChange,
  value,
  error = false,
  disabled = false,
  size = "md",
}: SelectProps<T>) => {
  const triggerStyles = clsx(
    baseStyles,
    darkStyles,
    sizeStyles[size],
    error && errorStyles,
    "flex justify-between",
    disabled && disabledStyles
  );
  const contentStyles = clsx(baseContentStyles, darkStyles);
  const itemStyles = baseItemStyles;
  const handleChange = (v: string) => {
    const selectedOption = options.find((o) => getOptionValue(o) === v);
    // using ! as the value should be in the list supplied
    onChange(selectedOption!);
  };
  return (
    <div className={textStyles}>
      <SelectPrimitive.Root name={name} onValueChange={handleChange} value={getOptionValue(value)}>
        <SelectPrimitive.Trigger className={triggerStyles} disabled={disabled} aria-label="project">
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDownIcon />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Content className={contentStyles}>
          <SelectPrimitive.ScrollUpButton />
          <SelectPrimitive.Viewport className="flex flex-col gap-y-2">
            {options.map((o, i) => (
              <SelectPrimitive.Item key={i} value={getOptionValue(o)} className={itemStyles}>
                <SelectPrimitive.ItemText>
                  <div className="flex flex-row items-center">
                    {getOptionIcon && getOptionIcon(o)}
                    {getOptionName(o)}
                  </div>
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Root>
    </div>
  );
};
