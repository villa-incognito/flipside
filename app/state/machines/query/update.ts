import { Query, QueryUpdate } from "@fscrypto/domain/src/query";
import { $path } from "remix-routes";
import { Subject, debounceTime, concatMap, Observable, of, from, map, catchError } from "rxjs";
import { POST } from "~/async/fetch";
import { actorSystem } from "~/state/system";
import { QueryActorRef } from "./query";

interface UpdateQueryProps {
  query: QueryUpdate;
  queryId: string;
}
export const updateQuery = async ({ query, queryId }: UpdateQueryProps) => {
  const data = await POST<Query>($path("/api/queries/:id/update", { id: queryId }), query);
  return data;
};

export type QueryUpdateEvent =
  | { type: "QUERY.UPDATE_SUCCESS"; payload: Query | null }
  | { type: "QUERY.UPDATE_FAILURE"; error: { status: number } | null };

export const createUpdateObservable = (update$$: Subject<void>, queryId: string) => {
  return update$$.pipe(
    debounceTime(1000),
    concatMap(() => updateQuery$(queryId))
  );
};

const updateQuery$ = (queryId: string): Observable<QueryUpdateEvent> => {
  const ref = actorSystem.get<QueryActorRef>(`query-${queryId}`);
  if (!ref) return of({ type: "QUERY.UPDATE_FAILURE", error: null } as QueryUpdateEvent);
  const query = ref.getSnapshot()?.context.query;
  if (!query) return of({ type: "QUERY.UPDATE_FAILURE", error: null } as QueryUpdateEvent);
  return from(updateQuery({ query, queryId })).pipe(
    map((data) => ({ type: "QUERY.UPDATE_SUCCESS", payload: data } as QueryUpdateEvent)),
    catchError((err: { status: number }) => of({ type: "QUERY.UPDATE_FAILURE", error: err } as QueryUpdateEvent))
  );
};
