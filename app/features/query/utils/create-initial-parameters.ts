import { uniqBy } from "lodash";
import { query } from "@fscrypto/domain";
import { EditorParam, getParamsFromStatement } from "./get-parameters-from-statement";
import { nanoid } from "nanoid";

/** this function takes the saved information we have from the query and converts it into an array of parameters
 * with all the information needed to edit, add and remove parameters */
export const createInitialParams = (
  statement: string,
  savedParameters: query.Query["parameters"],
  queryId: string
): EditorParam[] => {
  const paramsFromStatement = getParamsFromStatement(statement) ?? [];
  const allParams = paramsFromStatement.map((param) => {
    const value = savedParameters.find((initialParam) => param.name === initialParam.name);
    // is the param in saved parameters?
    if (value) {
      //just update the param with the latest position from the statement
      return { ...value, ...param };
    }
    // This shouldn't happen with our UI but external data changes can make this possible.
    // If there is no parameter saved for the parameter in the statement, create a new empty one.
    return {
      ...param,
      id: nanoid(),
      value: "",
      type: "text" as const,
      restrictedValues: null,
      queryId,
      updatedAt: new Date(),
      createdAt: new Date(),
      updatedById: null,
      createdById: null,
    };
  });

  return uniqBy(allParams, (param) => param.name);
};
