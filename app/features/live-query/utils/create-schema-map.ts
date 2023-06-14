import { FunctionSchema } from "@fscrypto/domain/src/data-schema";

/**
 * Creates a map of schema to function schema
 */
export const createChainSchemaMap = (schema: FunctionSchema[]): Record<string, FunctionSchema[]> => {
  return schema.reduce((acc, cur) => {
    if (!acc[cur.schema]) {
      acc[cur.schema] = [];
    }
    acc[cur.schema]?.push(cur);
    return acc;
  }, {} as Record<string, FunctionSchema[]>);
};
