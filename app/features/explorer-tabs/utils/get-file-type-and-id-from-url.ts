import { validate as uuidValidate } from "uuid";

//This is specific to the current use case of tabs for now. This will be made into a more generic machine in the near future
export const getFileTypeAndIdFromUrl = () => {
  const urlType = location.pathname.split("/")[2] as "queries" | "dashboards" | undefined;
  const urlId = location.pathname.split("/")[3] ?? "";
  const isValidUrlId = uuidValidate(urlId);
  const isValidUrlType = urlType === "dashboards" || urlType === "queries";
  return {
    fileType: isValidUrlType ? urlType : undefined,
    fileId: isValidUrlId ? urlId : undefined,
  };
};
