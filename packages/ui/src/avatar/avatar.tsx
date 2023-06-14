import clsx from "clsx";
import { useState } from "react";
import { optimizeCloudinaryImage } from "../utils";

interface AvatarProps {
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  src: string | undefined;
  variant?: "circle" | "square";
  className?: string;
}

const sizeStyles: Record<AvatarProps["size"], string> = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
  "2xl": "h-32 w-32",
  "3xl": "h-48 w-48",
};

const sizeToPixels: Record<AvatarProps["size"], number> = {
  xs: 16,
  sm: 48,
  md: 32,
  lg: 48,
  xl: 64,
  "2xl": 128,
  "3xl": 192,
};

const variantStyles: Record<"square" | "circle", string> = {
  circle: "rounded-full",
  square: "rounded-lg",
};

export function Avatar({ size = "md", src, variant = "circle", className = "" }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const pixels = sizeToPixels[size];
  const optimizedAvatarUrl = optimizeCloudinaryImage(src, pixels) ?? undefined;

  return !src || imageError || !optimizedAvatarUrl ? (
    <AvatarDefault size={size} variant={variant} className={className} />
  ) : (
    <div className={clsx("overflow-hidden", sizeStyles[size], variantStyles[variant])}>
      <img
        className={clsx("box-content", className)}
        src={optimizedAvatarUrl}
        height={sizeToPixels[size]}
        width={sizeToPixels[size]}
        alt="avatar"
        onError={() => {
          setImageError(true);
        }}
      />
    </div>
  );
}

const AvatarDefault = ({
  size = "md",
  variant = "circle",
  className = "",
}: {
  size: AvatarProps["size"];
  variant: AvatarProps["variant"];
  className: string;
}) => {
  return (
    <div
      className={clsx(
        sizeStyles[size],
        variantStyles[variant],
        "flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
        className
      )}
    ></div>
  );
};
