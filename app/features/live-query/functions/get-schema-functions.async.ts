import { Subject, of, from, map, catchError, switchMap } from "rxjs";
import { GET } from "~/async/fetch";
import { $path } from "remix-routes";
import { FunctionSchema } from "@fscrypto/domain/src/data-schema";

export const getFunctionSchemas$$ = new Subject<void>();

export const getFunctionSchemas = async () => GET<{ functions: FunctionSchema[] }>($path("/api/schema-functions"));

export type GetFunctionSchemaEvent =
  | { type: "LIVE_QUERY.FUNCTION_SCHEMAS.GET_SUCCESS"; payload: FunctionSchema[] }
  | { type: "LIVE_QUERY.FUNCTION_SCHEMAS.GET_FAILURE"; error: { status: number } | null };

export const createGetFunctionSchemasObservable = (get$$: Subject<void>) => {
  return get$$.pipe(
    switchMap(() =>
      from(getFunctionSchemas()).pipe(
        map((data) => {
          return { type: "LIVE_QUERY.FUNCTION_SCHEMAS.GET_SUCCESS", payload: data.functions } as GetFunctionSchemaEvent;
        }),
        catchError((err: { status: number }) =>
          of({ type: "LIVE_QUERY.FUNCTION_SCHEMAS.GET_FAILURE", error: err } as GetFunctionSchemaEvent)
        )
      )
    )
  );
};
