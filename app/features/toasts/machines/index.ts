import { useAtom } from "jotai";
import { atomWithMachine } from "jotai-xstate";
import { createToasterMachine } from "./toasts-machine";

const ToasterMachineAtom = atomWithMachine(() => {
  return createToasterMachine();
});

export const ToasterState = {
  useToaster: () => useAtom(ToasterMachineAtom),
};
