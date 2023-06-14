import { z } from "zod";
export const schema = z.union([z.literal("auto"), z.literal("number"), z.literal("date"), z.literal("string")]);

export type DataType = z.infer<typeof schema>;
