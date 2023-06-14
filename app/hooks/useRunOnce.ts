import { useRef } from "react";

/**
 * Function that allows code to be executed only once in a component.
 */
export function useRunOnce(fn: () => void) {
  const ref = useRef(false);
  if (!ref.current) {
    fn();
    ref.current = true;
  }
}
