import clsx from "clsx";
import React, { useCallback } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

type Size = "sm" | "md" | "lg";
type Type = "text" | "number" | "datetime-local" | "date";
export interface InputProps {
  /** Name of the input */
  name: string;
  /** Label for the input */
  label?: string;
  /** Display the label and input inline */
  inline?: boolean;
  /** Value that gets passed to the <input /> element for controlled inputs via state */
  value?: string;
  /** Default Value that gets passed to the <input /> element */
  defaultValue?: string;
  /** Max length <input /> element */
  maxLength?: number | undefined;
  /** Handler to call whenever the input value changes */
  onChange?: (v: string) => void;
  /** Handler to call whenever the input loses focus */
  onBlur?: (v: string) => void;
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
  type?: Type;
  /** Icon on left side of input */
  icon?: React.ReactNode;
  step?: string;
  pattern?: string;
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
export const Input = ({
  value,
  defaultValue,
  name,
  label,
  placeholder,
  onChange,
  onBlur,
  maxLength = undefined,
  size = "md",
  error = false,
  disabled = false,
  inline = false,
  type = "text",
  icon,
  step,
  pattern,
}: InputProps) => {
  const styles = clsx(
    baseStyles,
    darkStyles,
    sizeStyles[size],
    error && errorStyles,
    disabled && disabledStyles,
    icon && "pl-10"
  );
  const wrapperStyles = clsx(textStyles, inline && inlineStyles);
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.currentTarget.value);
    },
    [onChange]
  );
  const handleBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onBlur?.(e.currentTarget.value);
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
      <div className={clsx("w-full", icon && "relative")}>
        {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{icon}</div>}
        <input
          aria-label={`visual-edit-${name}`}
          className={styles}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          maxLength={maxLength}
          onChange={handleChange}
          onBlur={handleBlur}
          type={type}
          name={name}
          step={step}
          pattern={pattern}
        />
      </div>
    </div>
  );
};

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  truncate?: boolean;
}
export const Label = ({ children, htmlFor, truncate }: LabelProps) => {
  return (
    <LabelPrimitive.Root
      className={`text-sm text-gray-50 mr-2 dark:text-gray-30 ${truncate ? "truncate" : ""}`}
      htmlFor={htmlFor}
      aria-label="input-title"
    >
      {children}
    </LabelPrimitive.Root>
  );
};

interface InputGroupProps {
  children: React.ReactNode;
  inline?: boolean;
  dataTestId?: string;
}

/**
 * A wrapper for an input to ensure proper spacing between labels
 */
export const InputGroup = ({ children, inline = false, dataTestId }: InputGroupProps) => {
  const classes = clsx("flex w-full", !inline && "flex-col gap-y-1", inline && "items-center");
  return (
    <div className={classes} data-testid={dataTestId}>
      {React.Children.map(children, (c) => (inline ? <div className="flex-1 self-start">{c}</div> : c))}
    </div>
  );
};
