import { dataSchema } from "@fscrypto/domain";
import { differenceInMinutes } from "date-fns";
import localforage from "localforage";
import { from } from "rxjs";
import { GET } from "~/async/fetch";

export type GetSchemaTreeEvent = { type: "SCHEMA_LOADED"; payload: dataSchema.DataSchemaNode[] };
const SCHEMA_VALID_FOR_MINUTES = 30;
type schemaCache<T> = {
  timestamp: number;
  data: T;
};

export const getSchemaTree$ = () => from(fetchSchemaTree());

async function fetchSchemaTree() {
  const cachedSchema = await localforage.getItem<schemaCache<dataSchema.DataSchemaNode[]>>("schema-tree");
  if (cachedSchema && isCacheValid(cachedSchema.timestamp) && cachedSchema.data.length > 0) {
    return { type: "SCHEMA_LOADED", payload: cachedSchema.data };
  }
  const data = await GET<{ schema: dataSchema.DataSchemaNode[] }>("/api/schema-tree");
  const item: schemaCache<dataSchema.DataSchemaNode[]> = {
    timestamp: Date.now(),
    data: data.schema,
  };
  localforage.setItem("schema-tree", item).catch((err) => {
    console.error(err);
  });
  return { type: "SCHEMA_LOADED", payload: data.schema };
}
function isCacheValid(timestamp: number) {
  const mins = differenceInMinutes(new Date(), new Date(timestamp));
  const isValid = mins < SCHEMA_VALID_FOR_MINUTES;
  return isValid;
}
