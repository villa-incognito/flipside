import { Subject, of, from, map, catchError, switchMap } from "rxjs";
import { GET } from "~/async/fetch";
import { $path } from "remix-routes";
import { QuickNodeEndpoint } from "@fscrypto/domain/src/quicknode-endpoint";

export const getGoogleEndpoints = async () =>
  GET<QuickNodeEndpoint[]>($path("/api/integrations/quicknode-endpoints/get"));

export type GetQuickNodeEndpointsEvent =
  | { type: "LIVE_QUERY.QUICK_NODE.GET_ENDPOINTS_REQUEST" }
  | { type: "LIVE_QUERY.QUICK_NODE.GET_ENDPOINTS_SUCCESS"; payload: QuickNodeEndpoint[] }
  | { type: "LIVE_QUERY.QUICK_NODE.GET_ENDPOINTS_FAILURE"; error: { status: number } | null };

export const createGetQuickNodeEndpointsObservable = (get$$: Subject<void>) => {
  return get$$.pipe(
    switchMap(() =>
      from(getGoogleEndpoints()).pipe(
        map((payload) => {
          return {
            type: "LIVE_QUERY.QUICK_NODE.GET_ENDPOINTS_SUCCESS",
            payload,
          } as GetQuickNodeEndpointsEvent;
        }),
        catchError((err: { status: number }) =>
          of({ type: "LIVE_QUERY.QUICK_NODE.GET_ENDPOINTS_FAILURE", error: err } as GetQuickNodeEndpointsEvent)
        )
      )
    )
  );
};
