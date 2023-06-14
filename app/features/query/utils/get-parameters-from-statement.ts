import { query } from "@fscrypto/domain";
import { Liquid } from "liquidjs";
import type { OutputToken } from "liquidjs/dist/tokens/output-token";

/** this function uses the query statement and uses liquidjs to get the parameter names with start and end positions */
const engine = new Liquid();
export const getParamsFromStatement = (statement: string) => {
  try {
    // First get the parameters from the statement
    const paramsFromStatement: ParamToken[] = engine
      .parse(statement)
      .filter((param) => "value" in param)
      .map(({ token }) => {
        const { begin, content: name, end } = token as OutputToken;
        return { begin, name, end };
      });
    return paramsFromStatement;
  } catch (e) {
    //TODO: handle errors
    return null;
  }
};

export type ParamToken = { begin: number; end: number; name: string };
export type EditorParam = query.Query["parameters"][number] & ParamToken;
