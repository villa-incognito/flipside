import { z } from "zod";

const date = z.literal("date");
const linear = z.literal("linear");
const log = z.literal("log");
const time = z.literal("time");
const band = z.literal("band");
const auto = z.literal("auto");

export const schema = z.union([auto, date, linear, log, time, band]).default("auto");
export type Scale = z.infer<typeof schema>;
