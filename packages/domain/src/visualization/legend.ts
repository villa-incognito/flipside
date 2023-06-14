import { z } from "zod";

const position = z.union([z.literal("top"), z.literal("bottom"), z.literal("left"), z.literal("right")]);

export const schema = z.object({
  show: z.boolean().optional().default(true),
  position: position.default("top"),
  colorMap: z.optional(z.record(z.string())),
});

export type Legend = z.infer<typeof schema>;
