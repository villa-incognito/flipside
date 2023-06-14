import { useEffect, useRef } from "react";
import { defaultTextPanelValue } from "../dashboard-grid/command-bar";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  toggleEditing: () => void;
  isEditable: boolean;
}
export const TextArea = ({ onChange, value, toggleEditing, isEditable }: TextAreaProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // if its the default, clear it out so the user doesn't have to
  const renderedValue = value === defaultTextPanelValue ? "" : value;

  useEffect(() => {
    // When the component mounts, focus the input
    isEditable && inputRef.current?.focus();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <textarea
      ref={inputRef}
      onFocus={(e) => {
        e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
        e.currentTarget.scrollTop = e.currentTarget.scrollHeight;
      }}
      onBlur={(e) => {
        toggleEditing();
        if (isEditable) {
          onChange(e.target.value);
        }
      }}
      className="dark:bg-gray-90 dark:text-gray-30 h-full w-full border-2 px-4 pb-4 pt-8"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      defaultValue={renderedValue}
      onKeyDown={(e) => {
        switch (e.key) {
          case "Escape":
            toggleEditing();
            break;
        }
      }}
    />
  );
};
