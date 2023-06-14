import { CustomParameter } from "~/features/dashboard/dashboard-parameters/dashboard-parameters.machine";
import { EditorParam } from "./get-parameters-from-statement";

export const convertParamsWithCommas = (params: EditorParam[] | CustomParameter[]) => {
  return params.map((param) => {
    const { id, type, name, value, queryId } = param;
    if (value.includes(",")) {
      const values = value.split(",").map((val) => val.trim());
      return {
        ...param,
        id,
        type,
        name,
        value: values[0],
        restrictedValues: values.join(","),
        queryId,
      };
    }
    return { ...param, restrictedValues: null };
  });
};
