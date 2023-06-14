import { useEffect, useState } from "react";
import { BehaviorSubject, Observable } from "rxjs";

const isBehaviorSubject = <T>(observable: Observable<T> | BehaviorSubject<T>): observable is BehaviorSubject<T> =>
  (observable as BehaviorSubject<T>).getValue !== undefined;

export function useSubscription<T>(observable: Observable<T> | BehaviorSubject<T>, initialValue?: T): T {
  const [value, setValue] = useState(
    initialValue ?? (isBehaviorSubject(observable) ? observable.getValue() : undefined)
  );
  useEffect(() => {
    const subscription = observable.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [observable]);

  if (!isBehaviorSubject(observable) && initialValue === undefined) {
    throw new Error("Initial value must be provided for non-BehaviorSubject observables");
  }
  return value as T;
}
