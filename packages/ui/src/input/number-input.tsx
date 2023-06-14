import clsx from "clsx";
import React, { useCallback } from "react";
import { Label } from "./input";

type Size = "sm" | "md" | "lg";
export interface InputProps {
  /** Name of the input */
  name: string;
  /** Label for the input */
  label?: string;
  /** Display the label and input inline */
  inline?: boolean;
  /** Value that gets passed to the <input /> element for controlled inputs via state */
  value?: number;
  /** Default Value that gets passed to the <input /> element */
  defaultValue?: number;
  /** Min value for input */
  max?: number;
  /** Max value for input */
  min?: number;
  /** Handler to call whenever the input value changes */
  onChange?: (v: number) => void;
  /** Handler to call whenever the input loses focus */
  onBlur?: (v: number) => void;
  /** Size of the input */
  size?: Size;
  /** Placeholder text to show before user inputs anything */
  placeholder?: string;
  /** Whether to show the input in an error state */
  error?: boolean;
  /** An optional label to show under the input when there's an error */
  errorLabel?: boolean;
  /** Whether or not the input is disabled */
  disabled?: boolean;
  /** Type of input */
}

// Use of ! for important styles so that styles in `error` and `disabled` can properly override the base styles
const textStyles = "dark:text-gray-10";
const baseStyles = "border border-gray-30 rounded-md text-[14px] outline-none focus:!border-blue-50 w-full ";
const darkStyles = "dark:border-gray-70 dark:bg-gray-90";
const smStyles = "px-3 py-1";
const mdStyles = "px-4 py-2";
const lgStyles = "px-4 py-3";
const inlineStyles = "flex gap-x-4";
const errorStyles = "!border-red-50 focus:!border-red-50";
const disabledStyles = "text-gray-30 dark:!text-gray-60 dark:!bg-gray-80";

const sizeStyles: Record<Size, string> = {
  sm: smStyles,
  md: mdStyles,
  lg: lgStyles,
};
export const NumberInput = ({
  value,
  defaultValue,
  name,
  label,
  placeholder,
  onChange,
  onBlur,
  max,
  min,
  size = "md",
  error = false,
  disabled = false,
  inline = false,
}: InputProps) => {
  const styles = clsx(baseStyles, darkStyles, sizeStyles[size], error && errorStyles, disabled && disabledStyles);
  const wrapperStyles = clsx(textStyles, inline && inlineStyles);
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(+e.currentTarget.value);
    },
    [onChange]
  );
  const handleBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onBlur?.(+e.currentTarget.value);
    },
    [onBlur]
  );
  return (
    <div className={wrapperStyles}>
      {label && (
        <div className="mb-2">
          <Label htmlFor={name}>{label}</Label>
        </div>
      )}
      <div className="w-full">
        <input
          aria-label="input-field"
          className={styles}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          max={max}
          min={min}
          onChange={handleChange}
          onBlur={handleBlur}
          name={name}
          type="number"
        />
      </div>
    </div>
  );
};
