import { useState, useEffect } from "react";
import { filter, switchMap, combineLatest, from, of, distinctUntilChanged, map } from "rxjs";
import { AnyActorRef } from "xstate";
import { ActorSystemKey, system$$ } from "./system";

/**
 * Use this to get an actor from the system when you know the ID.
 * The actor may or may not be in the system, so initially the value will be null.
 * If / when the actor is added to the system, the value will be updated.
 *
 * This subscribes to any changes in the actor. If we find this causes performance issues,
 * we can optimize with a selector function
 *
 * @returns [actorState, actorRef], The state can be used to access `context`, and you can send events to the `ref`
 */
export const useActorFromSystem = <R extends AnyActorRef>(id: ActorSystemKey) => {
  const [actorRef, setActorRef] = useState<R | null>(null);
  const [actorState, setActorState] = useState<ReturnType<R["getSnapshot"]> | null>(null);

  useEffect(() => {
    const obs$ = system$$.pipe(
      map((system) => system.get(id)),
      filter((a) => !!a),
      switchMap((a) => combineLatest([from(a!), of(a!)])),
      distinctUntilChanged()
    );
    const sub = obs$.subscribe(([state, ref]) => {
      setActorRef(ref as R);
      setActorState(state);
    });

    return () => sub.unsubscribe();
  }, [id]);

  return [actorState, actorRef] as [ReturnType<R["getSnapshot"]>, R] | [null, null];
};

/**
 * Use this to subscribe to updates from an actor ref that may not be in a system.
 * This is useful for when actors have childrefs that are not in the system.
 */
export const useActorFromRef = <R extends AnyActorRef>(ref?: R) => {
  const [actorRef, setActorRef] = useState<R | null>(null);
  const [actorState, setActorState] = useState<ReturnType<R["getSnapshot"]> | null>(null);

  useEffect(() => {
    const obs$ = of(ref).pipe(
      filter((a) => !!a),
      switchMap((a) => combineLatest([from(a!), of(a!)])),
      distinctUntilChanged()
    );
    const sub = obs$.subscribe(([state, ref]) => {
      setActorRef(ref as R);
      setActorState(state);
    });

    return () => sub.unsubscribe();
  }, [ref]);

  return [actorState, actorRef] as [ReturnType<R["getSnapshot"]>, R] | [null, null];
};
