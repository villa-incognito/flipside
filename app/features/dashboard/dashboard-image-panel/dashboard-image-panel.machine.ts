import type { fileUpload } from "@fscrypto/domain";
import type { ActorRefFrom, StateFrom } from "xstate";
import { createMachine, assign, sendParent } from "xstate";
import { $path } from "remix-routes";
import { useSelector } from "@xstate/react";

interface ImagePanelProps {
  cellId: string;
  url: string;
}

export const createImagePanelMachine = ({ cellId, url }: ImagePanelProps) => {
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgBsB7dCAqAYggsJIIDcKBrMEgMzABccANVywArujK4AXun64mAbQAMAXUSgADhVi55TDSAAeiACzKAzCWWmAbAA4A7AFYANCACeiAIyOAnNYATBamFi4AvuHuaFh4hKSU1LR0YABOqRSpJJpkcjyZqLwCwqISUrL6+CrqSCDaupWGJgjmVjYOLu5eCPaBJM6R0Rg4BMQkaRmpdEaw-HLc6Dz8aciByutEdDEj8ePpmdWG9XoK+E2Ijt7KJCFhbp6Ivf2RUSD4FBBwhttxxEc6JwMtWaAFpbF1EGDBiAfqMElQaPgoP8Gqdzi1AhCEN5bBZobDdrgIGQwCjAWdgY8LFZbIF7t1vH4rANXgSxhNMmTGpSELTrr17N46VjBc8XkA */
  const machine = createMachine(
    {
      id: `imagePanel-${cellId}`,
      tsTypes: {} as import("./dashboard-image-panel.machine.typegen").Typegen0,
      schema: {
        context: {} as ImagePanelContext,
        events: {} as ImagePanelEvent,
      },
      context: {
        url,
        cellId,
      },
      initial: "idle",
      states: {
        complete: {
          id: "complete",
        },
        idle: {
          always: [
            {
              target: "upload",
              cond: "hasUrl",
            },
          ],
        },
        upload: {
          initial: "select",
          states: {
            select: {
              on: {
                "DASHBOARD.IMAGE_PANEL.CANCEL_UPLOAD": {
                  target: "cancel",
                  actions: ["removeCell"],
                },
                "DASHBOARD.IMAGE_PANEL.SELECT_FILE": {
                  target: "selected",
                  actions: ["selectFile"],
                },
              },
            },
            selected: {
              on: {
                "DASHBOARD.IMAGE_PANEL.CANCEL_UPLOAD": {
                  target: "cancel",
                  actions: ["removeCell"],
                },
                "DASHBOARD.IMAGE_PANEL.START_UPLOAD": {
                  target: "saving",
                },
              },
            },
            cancel: {},
            saving: {
              invoke: {
                id: "uploadImage",
                src: "uploadImage",
                onDone: {
                  target: "#complete",
                  actions: ["uploadComplete", "updateCellFormula"],
                },
                onError: {
                  target: "select",
                },
              },
            },
          },
        },
      },
    },
    {
      services: {
        uploadImage: (context) => {
          const url = window.location.protocol + "//" + window.location.host + $path("/api/file-upload");
          const formData = new FormData();
          formData.append("file", context.selectedFile!);
          return fetch(url, {
            method: "post",
            body: formData,
          }).then((response) => response.json());
        },
      },
      actions: {
        uploadComplete: sendParent((context, event) => {
          const url = event.data.file.url;
          return {
            type: "DASHBOARD.GRID.UPDATE_CELL_FORMULA",
            payload: {
              cellId: context.cellId,
              formula: { imageName: url },
            },
          };
        }),
        updateCellFormula: assign((context, event) => {
          const url = event.data.file.url;
          return {
            url,
          };
        }),
        removeCell: sendParent((context) => {
          return {
            type: "DASHBOARD.GRID.REMOVE_CELL",
            payload: { cellId: context.cellId },
          };
        }),
        selectFile: assign((context, event) => {
          return {
            selectedFile: event.file,
          };
        }),
      },
      guards: {
        hasUrl: (context) => !context.url,
      },
    }
  );
  return machine;
};

interface ImagePanelContext {
  url?: string;
  cellId: string;
  selectedFile?: File;
}

type ImagePanelEvent =
  | { type: "done.invoke.uploadImage"; data: { file: fileUpload.FileUpload } }
  | {
      type: "DASHBOARD.IMAGE_PANEL.CANCEL_UPLOAD";
    }
  | {
      type: "DASHBOARD.IMAGE_PANEL.SELECT_FILE";
      file: File;
    }
  | {
      type: "DASHBOARD.IMAGE_PANEL.START_UPLOAD";
    };

export type ImagePanelActorRef = ActorRefFrom<ReturnType<typeof createImagePanelMachine>>;
export type ImagePanelActorState = StateFrom<ReturnType<typeof createImagePanelMachine>>;

export const useImagePanelMachine = (cellRef: ImagePanelActorRef) => {
  const cancelUpload = () => cellRef.send({ type: "DASHBOARD.IMAGE_PANEL.CANCEL_UPLOAD" });
  const selectFile = (file: File) => cellRef.send({ type: "DASHBOARD.IMAGE_PANEL.SELECT_FILE", file });
  const startUpload = () => cellRef.send({ type: "DASHBOARD.IMAGE_PANEL.START_UPLOAD" });

  const hasSelection = useSelector(cellRef, hasSelectionSelector);
  const isSaving = useSelector(cellRef, isSavingSelector);
  const showUpload = useSelector(cellRef, showUploadSelector);
  const selectedFile = useSelector(cellRef, selectedFileSelector);
  const imageUrl = useSelector(cellRef, imageUrlSelector);

  return {
    startUpload,
    cancelUpload,
    selectFile,
    hasSelection,
    isSaving,
    showUpload,
    selectedFile,
    imageUrl,
  };
};

const hasSelectionSelector = (state: ImagePanelActorState) => state.matches("upload.selected");
const isSavingSelector = (state: ImagePanelActorState) => state.matches("upload.saving");
const showUploadSelector = (state: ImagePanelActorState) => state.matches("upload");
const selectedFileSelector = (state: ImagePanelActorState) => state.context.selectedFile;
const imageUrlSelector = (state: ImagePanelActorState) => state.context.url;
