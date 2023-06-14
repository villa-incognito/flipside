import { Subject, of, from, map, catchError, switchMap } from "rxjs";
import { POST } from "~/async/fetch";

export const removeGoogleEndpoint = async ({ id }: { id: string }) =>
  POST<{ id: string }>(`/api/integrations/google-node-endpoints/${id}/delete`);

export type RemoveGoogleNodeEndpointEvent =
  | { type: "LIVE_QUERY.GOOGLE_NODE.REMOVE_ENDPOINT_REQUEST"; payload: { id: string } }
  | { type: "LIVE_QUERY.GOOGLE_NODE.REMOVE_ENDPOINT_SUCCESS"; payload: { id: string } }
  | { type: "LIVE_QUERY.GOOGLE_NODE.REMOVE_ENDPOINT_FAILURE"; error: { status: number } | null };

export const createRemoveGoogleEndpointObservable = (post$$: Subject<{ id: string }>) => {
  return post$$.pipe(
    switchMap((e) =>
      from(removeGoogleEndpoint(e)).pipe(
        map((data) => {
          return {
            type: "LIVE_QUERY.GOOGLE_NODE.REMOVE_ENDPOINT_SUCCESS",
            payload: data,
          } as RemoveGoogleNodeEndpointEvent;
        }),
        catchError((err: { status: number }) =>
          of({ type: "LIVE_QUERY.GOOGLE_NODE.REMOVE_ENDPOINT_FAILURE", error: err } as RemoveGoogleNodeEndpointEvent)
        )
      )
    )
  );
};
