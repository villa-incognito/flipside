import { applyMeta, MetaType, stringify } from "remix-typedjson";
import { omit } from "lodash";
import {
  filter,
  firstValueFrom,
  map,
  merge,
  Observable,
  retry,
  share,
  switchMap,
  throwError,
  withLatestFrom,
} from "rxjs";
import { fromFetch } from "rxjs/fetch";

export const POST = <T>(path: string, data?: object) => {
  const url = `${window.location.protocol}//${window.location.host}${path}`;
  const response$ = fromFetch(url, {
    method: "POST",
    body: data ? stringify(data) : undefined,
    headers: {
      "Content-Type": "application/json",
    },
  }).pipe(retry({ count: 3, delay: 1500 }), share());
  return handleResponse<T>(response$);
};

export const POSTFormData = <T>(url: string, data: FormData) => {
  const response$ = fromFetch(url, {
    method: "POST",
    body: data,
  }).pipe(retry({ count: 3, delay: 1500 }), share());
  return handleResponse<T>(response$);
};

export const GET = <T>(path: string): Promise<T> => {
  const url = `${window.location.protocol}//${window.location.host}${path}`;
  const response$ = fromFetch(url).pipe(retry({ count: 3, delay: 500 }), share());
  return handleResponse<T>(response$);
};

// Helpers
type TypedResponse<T> = T & { __meta__?: MetaType };

const handleResponse = <T>(response$: Observable<Response>) => {
  // const unauthenticated$ = response$.pipe(
  //   filter((r) => r.status === 401),
  //   tap(() => (window.location.pathname = "/auth/auth0")),
  //   switchMap(() => throwError(() => new Error("Unauthenticated")))
  // );
  const failure$ = response$.pipe(
    filter((r) => !r.ok),
    switchMap((r) => r.json() as Promise<{ message: string } | null>),
    withLatestFrom(response$),
    switchMap(([r, res]) => throwError(() => ({ message: r?.message ?? "Unknown Error", status: res.status })))
  );
  const success$ = response$.pipe(
    filter((r) => r.ok),
    switchMap((r) => r.json() as Promise<TypedResponse<T>>),
    map(deserialize)
  );
  return firstValueFrom(merge(success$, failure$));
};

const deserialize = <T>(response: TypedResponse<T>): T => {
  if (response.__meta__) {
    return applyMeta(omit(response, "__meta__"), response.__meta__!) as T;
  }
  return response;
};
