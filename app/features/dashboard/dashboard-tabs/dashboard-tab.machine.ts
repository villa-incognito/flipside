import type { ActorRefFrom, StateFrom } from "xstate";
import { $path } from "remix-routes";
import { createMachine, assign, sendParent } from "xstate";
import type { fileUpload } from "@fscrypto/domain";
import { useSelector } from "@xstate/react";

interface CreateTabMachineProps {
  title: string;
  url?: string;
  id: string;
}

export const createTabMachine = ({ title, url, id }: CreateTabMachineProps) => {
  const machine = createMachine(
    {
      id: `tabMachine-${id}`,
      tsTypes: {} as import("./dashboard-tab.machine.typegen").Typegen0,
      schema: {
        context: {} as TabContext,
        events: {} as TabEvent,
      },
      type: "parallel",
      context: {
        title,
        url,
        id,
      },
      states: {
        data: {
          initial: "idle",
          states: {
            idle: {
              on: {
                "DASHBOARD.TAB.EDIT_TAB": {
                  target: "editing",
                },
                "DASHBOARD.TAB.SET_NEW_INDEX": {
                  actions: "setNewIndex",
                },
              },
            },
            editing: {
              id: "editing",
              on: {
                "DASHBOARD.TAB.UPDATE_TITLE": {
                  actions: ["updateTitle", "updateTab"],
                },
                "DASHBOARD.TAB.UPDATE_URL": {
                  actions: ["updateUrl", "updateTab"],
                },
                "DASHBOARD.TAB.CLOSE_EDITING": {
                  target: "idle",
                },
                "DASHBOARD.TAB.REMOVE_TAB": {
                  actions: ["removeTab"],
                },
                "DASHBOARD.TAB.SET_IMAGE": {
                  actions: ["setImage"],
                  target: "editing.uploading",
                },
              },
              initial: "idle",
              states: {
                idle: {},
                uploading: {
                  invoke: {
                    id: "uploadImage",
                    src: "uploadImage",
                    onDone: {
                      target: "idle",
                      actions: ["uploadComplete", "updateTab"],
                    },
                  },
                },
              },
            },
          },
        },
        hover: {
          initial: "no",
          states: {
            yes: {
              on: {
                "DASHBOARD.TAB.MOUSE_LEAVE": "no",
              },
            },
            no: {
              on: {
                "DASHBOARD.TAB.MOUSE_ENTER": "yes",
              },
            },
          },
        },
      },
    },
    {
      actions: {
        uploadComplete: assign((context, event) => {
          const url = event.data.file.url;
          return {
            url,
          };
        }),
        setImage: assign((context, event) => {
          return {
            selectedFile: event.file,
          };
        }),
        updateTitle: assign((context, event) => {
          return {
            title: event.title,
          };
        }),
        removeTab: sendParent((context) => {
          return {
            type: "DASHBOARD.TABS.REMOVE_TAB",
            id: context.id,
          };
        }),
        updateTab: sendParent(({ title, url, id }) => {
          return {
            type: "DASHBOARD.TABS.UPDATE_TAB",
            payload: { tab: { title, url, id } },
          };
        }),
      },
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
    }
  );
  return machine;
};

interface TabContext {
  title: string;
  url?: string;
  selectedFile?: File;
  id: string;
}

type TabEvent =
  | {
      type: "DASHBOARD.TAB.EDIT_TAB";
    }
  | {
      type: "DASHBOARD.TAB.SET_ACTIVE_TAB";
      index: number;
    }
  | {
      type: "DASHBOARD.TAB.UPDATE_TITLE";
      title: string;
    }
  | {
      type: "DASHBOARD.TAB.UPDATE_URL";
      title: string;
    }
  | {
      type: "DASHBOARD.TAB.CLOSE_EDITING";
    }
  | {
      type: "DASHBOARD.TAB.REMOVE_TAB";
    }
  | {
      type: "DASHBOARD.TAB.SET_IMAGE";
      file: File;
    }
  | { type: "done.invoke.uploadImage"; data: { file: fileUpload.FileUpload } }
  | {
      type: "DASHBOARD.TAB.MOUSE_ENTER";
    }
  | {
      type: "DASHBOARD.TAB.MOUSE_LEAVE";
    }
  | {
      type: "DASHBOARD.TAB.SET_NEW_INDEX";
      index: number;
    };

export type DashboardTabActorRef = ActorRefFrom<ReturnType<typeof createTabMachine>>;
export type DashboardTabState = StateFrom<ReturnType<typeof createTabMachine>>;

export const useTabMachine = (tabRef: DashboardTabActorRef) => {
  const mouseEnter = () => tabRef.send("DASHBOARD.TAB.MOUSE_ENTER");
  const mouseLeave = () => tabRef.send("DASHBOARD.TAB.MOUSE_LEAVE");
  const editTab = () => tabRef.send("DASHBOARD.TAB.EDIT_TAB");
  const updateTitle = (title: string) => tabRef.send({ type: "DASHBOARD.TAB.UPDATE_TITLE", title });
  const setImage = (file: File) => tabRef.send({ type: "DASHBOARD.TAB.SET_IMAGE", file });
  const removeTab = () => tabRef.send("DASHBOARD.TAB.REMOVE_TAB");

  return {
    isHovering: useSelector(tabRef, isHoveringSelector),
    isUploading: useSelector(tabRef, isUploadingSelector),
    mouseEnter,
    mouseLeave,
    editTab,
    updateTitle,
    setImage,
    removeTab,
    context: useSelector(tabRef, dataSelector),
  };
};

const isHoveringSelector = (state: DashboardTabState) => {
  return state.matches("hover.yes");
};

const isUploadingSelector = (state: DashboardTabState) => {
  return state.matches("data.editing.uploading");
};

const dataSelector = (state: DashboardTabState) => {
  return state.context;
};
