import MDEditor from "@uiw/react-md-editor";
import { cleanHtml } from "~/features/dashboard/util/clean-html";
import { useUserStateMachine } from "~/state/machines/user-state/user-state";

// import { useAppTheme } from "~/hooks/useAppTheme";

interface MarkdownProps {
  height: number;
  toggleEditing: () => void;
  value: string;
}
/** markdown style overrides are in markdown-styles.css */
export const Markdown = ({ height, value, toggleEditing }: MarkdownProps) => {
  const { theme } = useUserStateMachine();
  const sanitizedValue = cleanHtml(value);

  return (
    <div data-color-mode={theme} className="wmde-markdown">
      <MDEditor
        autoFocus={true}
        onBlur={() => toggleEditing()}
        height={height}
        value={removeInvalidMarkdownFromVelocity(sanitizedValue)}
        overflow={true}
        className="h-full w-full"
        hideToolbar={true}
        enableScroll={true}
        toolbarBottom={false}
        visibleDragbar={false}
        onKeyDown={(e) => {
          switch (e.key) {
            case "Escape":
              toggleEditing();
              break;
          }
        }}
        preview={"preview"}
      />
    </div>
  );
};

const removeInvalidMarkdownFromVelocity = (text: string) => {
  return text
    .replaceAll("\n:::warning\n", "")
    .replaceAll("\n:::info\n", "")
    .replaceAll("\n:::tip\n", "")
    .replaceAll(":::", "")
    .replaceAll("**==", "**")
    .replaceAll("==**", "**")
    .replaceAll("\n\\", "");
};
