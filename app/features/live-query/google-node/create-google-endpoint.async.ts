import { Subject, of, from, map, catchError, switchMap } from "rxjs";
import { POST } from "~/async/fetch";
import { $path } from "remix-routes";
import { GoogleNodeEndpoint, GoogleNodeEndpointNew } from "@fscrypto/domain/src/google-node-endpoint";

export const createGoogleEndpoint = async (payload: GoogleNodeEndpointNew) =>
  POST<GoogleNodeEndpoint>($path(`/api/integrations/google-node-endpoints/create`), payload);

export type CreateGoogleNodeEndpointEvent =
  | { type: "LIVE_QUERY.GOOGLE_NODE.CREATE_ENDPOINT_REQUEST"; payload: GoogleNodeEndpointNew }
  | { type: "LIVE_QUERY.GOOGLE_NODE.CREATE_ENDPOINT_SUCCESS"; payload: GoogleNodeEndpoint }
  | { type: "LIVE_QUERY.GOOGLE_NODE.CREATE_ENDPOINT_FAILURE"; error: { status: number } | null };

export const createCreateGoogleEndpointObservable = (post$$: Subject<GoogleNodeEndpointNew>) => {
  return post$$.pipe(
    switchMap((e) =>
      from(createGoogleEndpoint(e)).pipe(
        map((data) => {
          return {
            type: "LIVE_QUERY.GOOGLE_NODE.CREATE_ENDPOINT_SUCCESS",
            payload: data,
          } as CreateGoogleNodeEndpointEvent;
        }),
        catchError((err: { status: number }) =>
          of({ type: "LIVE_QUERY.GOOGLE_NODE.CREATE_ENDPOINT_FAILURE", error: err } as CreateGoogleNodeEndpointEvent)
        )
      )
    )
  );
};
