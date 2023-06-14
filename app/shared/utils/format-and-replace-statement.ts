import { format } from "sql-formatter";

export const formatAndReplace = (statement: string) => {
  const replacedStatement = statement.replaceAll("{{", "__pre__").replaceAll("}}", "__post__");
  const formatted = format(replacedStatement, { language: "snowflake" });
  return formatted.replaceAll("__pre__", "{{").replaceAll("__post__", "}}");
};
