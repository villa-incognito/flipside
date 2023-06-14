import { Subject, of, from, map, catchError, switchMap } from "rxjs";
import { GET } from "~/async/fetch";
import { $path } from "remix-routes";
import { GoogleNodeEndpoint } from "@fscrypto/domain/src/google-node-endpoint";

export const getGoogleEndpoints = async () =>
  GET<GoogleNodeEndpoint[]>($path("/api/integrations/google-node-endpoints/get"));

export type GetGoogleEndpointsEvent =
  | { type: "LIVE_QUERY.GOOGLE_NODE.GET_ENDPOINTS_REQUEST" }
  | { type: "LIVE_QUERY.GOOGLE_NODE.GET_ENDPOINTS_SUCCESS"; payload: GoogleNodeEndpoint[] }
  | { type: "LIVE_QUERY.GOOGLE_NODE.GET_ENDPOINTS_FAILURE"; error: { status: number } | null };

export const createGetGoogleEndpointsObservable = (get$$: Subject<void>) => {
  return get$$.pipe(
    switchMap(() =>
      from(getGoogleEndpoints()).pipe(
        map((payload) => {
          return {
            type: "LIVE_QUERY.GOOGLE_NODE.GET_ENDPOINTS_SUCCESS",
            payload,
          } as GetGoogleEndpointsEvent;
        }),
        catchError((err: { status: number }) =>
          of({ type: "LIVE_QUERY.GOOGLE_NODE.GET_ENDPOINTS_FAILURE", error: err } as GetGoogleEndpointsEvent)
        )
      )
    )
  );
};
