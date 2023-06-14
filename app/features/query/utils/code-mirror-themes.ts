import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";

export const light = createTheme({
  theme: "light",
  settings: {
    background: "#fff",
    foreground: "#24292e",
    selection: "#3ca3ff",
    selectionMatch: "#BBDFFF",
    gutterBackground: "#fff",
    gutterForeground: "#6e7781",
  },
  styles: [
    { tag: [t.comment, t.bracket], color: "#6a737d" },
    { tag: [t.propertyName], color: "#6f42c1" },
    { tag: [t.className], color: "#6f42c1" },
    { tag: [t.variableName, t.attributeName, t.number, t.operator], color: "rgb(237 129 12)" },
    { tag: [t.keyword, t.typeName, t.typeOperator, t.typeName], color: "rgb(48 105 254)" },
    { tag: [t.string, t.meta, t.regexp], color: "rgb(87 173 35)" },
    { tag: [t.name, t.quote], color: "#484d52" },
    { tag: [t.heading], color: "#24292e", fontWeight: "bold" },
    { tag: [t.emphasis], color: "#24292e", fontStyle: "italic" },
    { tag: [t.deleted], color: "#b31d28", backgroundColor: "#ffeef0" },
  ],
});

export const dark = createTheme({
  theme: "dark",
  settings: {
    background: "rgb(37,37,37)",
    foreground: "#c9d1d9",
    caret: "#c9d1d9",
    selection: "#444",
    lineHighlight: "#333333",
    gutterBackground: "#252525",
  },
  styles: [
    { tag: [t.comment, t.bracket], color: "#8b949e" },
    { tag: [t.className, t.propertyName], color: "#d2a8ff" },
    { tag: [t.variableName, t.attributeName, t.number, t.operator], color: "#79c0ff" },
    { tag: [t.keyword, t.typeName, t.typeOperator, t.typeName], color: "#ff7b72" },
    { tag: [t.string, t.meta, t.regexp], color: "#a5d6ff" },
    { tag: [t.name, t.quote], color: "#7ee787" },
    { tag: [t.heading], color: "#d2a8ff", fontWeight: "bold" },
    { tag: [t.emphasis], color: "#d2a8ff", fontStyle: "italic" },
    { tag: [t.deleted], color: "#ffdcd7", backgroundColor: "#ffeef0" },
  ],
});
