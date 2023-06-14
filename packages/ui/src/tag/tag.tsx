import clsx from "clsx";
import { CloseIcon } from "../icons";

interface TagProps {
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "sm" | "md";
  onClose?: () => void;
}

const baseStyles = "w-fit text-sm rounded-full";
const defaultStyles = "bg-blue-10 text-blue-50 dark:bg-gray-60 dark:text-gray-30";
const defaultIconContainerStyles = "hover:bg-blue-20 p-1 hover:text-blue-50 text-blue-30";
const outlineIconContainerStyles = "hover:bg-gray-15 p-1 hover:text-gray-60 text-gray-30";
const iconContainerStyles = { default: defaultIconContainerStyles, outline: outlineIconContainerStyles };
const outlineStyles = "border";
const variantStyles = { default: defaultStyles, outline: outlineStyles };
const smStyles = "px-2";
const mdStyles = "px-2 py-1";
const sizeStyles = { sm: smStyles, md: mdStyles };

export const Tag = ({ children, variant = "default", size = "md", onClose }: TagProps) => {
  const styles = clsx(baseStyles, variantStyles[variant], sizeStyles[size], "flex items-center justify-center gap-x-1");
  const iconContainerClasses = clsx("rounded-full", iconContainerStyles[variant]);

  return (
    <div className={styles}>
      <span className="py-1">{children}</span>
      {onClose && (
        <button className={iconContainerClasses} onClick={onClose}>
          <CloseIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
