import { nanoid } from "nanoid";
import { EditorParam, ParamToken } from "./get-parameters-from-statement";
import { EditorState } from "@codemirror/state";

export const updateEditorParams = (
  paramsFromStatement: ParamToken[],
  editorParams: EditorParam[],
  editorState: EditorState | undefined,
  queryId: string
): EditorParam[] => {
  const editorPosition = editorState?.selection.main.head ?? 0;
  const newEditorParams: EditorParam[] = [];

  paramsFromStatement.forEach((newParam) => {
    if (!newParam.name.length) {
      return;
    }
    // first find if there is an atom saved with the same name
    const editorParam = editorParams.find((editorParam) => editorParam.name === newParam.name);
    // If there is one with the same name, update the position and add it to the new array
    if (editorParam) {
      const updatedParam = { ...editorParam, ...newParam };
      //replace the updatedParam from newEditorParams if it already exists
      const index = newEditorParams.findIndex((param) => param.id === updatedParam.id);
      if (index > -1) {
        newEditorParams[index] = updatedParam;
      } else {
        newEditorParams.push(updatedParam);
      }
    } else {
      // If there is no atom with the same name, this means that the name has been edited or there is a new param present

      // first check if the new param is within the cursor position of a current editorParam
      const updatedNameParam = editorParams.find((editorParam) => {
        return editorPosition >= editorParam?.begin && editorPosition < editorParam.end;
      });

      // if there is a param with a cursor hit, we update the name and position and add it to the array
      if (updatedNameParam) {
        newEditorParams.push({ ...updatedNameParam, ...newParam });
      } else {
        // if there no name or position match there must be a new param added so create a new one
        newEditorParams.push({
          ...newParam,
          id: nanoid(),
          value: "",
          type: "text",
          queryId,
          restrictedValues: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdById: null,
          updatedById: null,
        });
      }
    }
  });
  return newEditorParams;
};
