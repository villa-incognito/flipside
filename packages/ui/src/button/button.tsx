import React from "react";
import clsx from "clsx";
import { Slot } from "@radix-ui/react-slot";

type Variant = "primary" | "secondary" | "success" | "warning" | "cancel" | "secondaryGreen";

type Sizes = "xs" | "sm" | "md" | "lg" | "xl";

const baseStyles =
  "inline-flex justify-center items-center font-medium transition-colors duration-100 ease-in-out tracking-wide";

const variantStyles: Record<Variant, string> = {
  primary: "text-white bg-blue-50 hover:bg-blue-60",
  warning: "text-white bg-red-50 hover:bg-red-60",
  success: "text-white bg-green-50 hover:bg-green-60",
  secondary:
    "text-gray-70 bg-white border border-gray-20 shadow shadow-black/5 hover:bg-gray-10 dark:bg-gray-100 dark:border-gray-80 dark:text-white",
  cancel: "text-red-700 hover:text-white border border-gray-300 hover:bg-red-800",
  secondaryGreen: "text-green-50 hover:text-white border border-gray-300 hover:bg-green-60",
};

const sizeStyles: Record<Sizes, string> = {
  xs: "px-2 rounded-md h-6 text-xs",
  sm: "px-2 rounded-lg h-8 text-sm",
  md: "px-4 rounded-lg h-10 text-sm",
  lg: "px-4 rounded-lg h-12 text-sm",
  xl: "px-6 rounded-lg h-14 text-base",
};

type ButtonProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
  color?: "primary" | "warning" | "success";
  variant: Variant;
  size: Sizes;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  dataTestId?: string;
};

export const Button = React.forwardRef<React.ElementRef<"button">, ButtonProps>(
  ({ asChild = false, className, disabled, dataTestId = "", ...props }, forwardedRef) => {
    const classes = clsx(baseStyles, variantStyles[props.variant], sizeStyles[props.size], className, {
      "opacity-50 cursor-not-allowed": disabled,
    });
    const Comp = asChild ? Slot : "button";
    return <Comp {...props} ref={forwardedRef} className={classes} data-testid={dataTestId} />;
  }
);

Button.displayName = "Button";
