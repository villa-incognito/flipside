import { Switch } from "@headlessui/react";
import clsx from "clsx";

interface ToggleProps {
  label: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  disabled?: boolean;
}
const baseSwitchStyles =
  "relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-blue-50";
const baseToggleStyles =
  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out";
export const Toggle = ({ label, enabled, setEnabled, disabled = false }: ToggleProps) => {
  const switchStyles = clsx(
    enabled
      ? "!bg-blue-50 hover:!bg-blue-60 disabled:bg-blue-20 disabled:hover:bg-blue-20 dark:!bg-blue-800 dark:hover:!bg-blue-900 dark:disabled:bg-blue-900 dark:disabled:hover:bg-blue-800"
      : "!bg-gray-20 hover:!bg-gray-30 disabled:bg-gray-15 disabled:hover:bg-gray-15 dark:!bg-gray-60 dark:hover:!bg-gray-70 dark:disabled:bg-gray-70 dark:disabled:hover:bg-gray-80",
    baseSwitchStyles
  );
  const toggleStyles = clsx(enabled ? "translate-x-5" : "translate-x-0", baseToggleStyles);
  return (
    <Switch checked={enabled} onChange={setEnabled} className={switchStyles} disabled={disabled}>
      <span className="sr-only dark:text-gray-30">{label}</span>
      <span aria-hidden="true" className={toggleStyles} />
    </Switch>
  );
};
