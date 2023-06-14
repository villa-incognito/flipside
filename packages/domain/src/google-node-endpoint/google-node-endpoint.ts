import { z } from "zod";

export const schema = z.object({
  id: z.string().uuid(),
  httpUrl: z.string().min(1),
  chain: z.string().min(1),
  network: z.string().min(1),
  createdById: z.string().uuid(),
  updatedById: z.string().uuid(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const newSchema = schema.pick({
  httpUrl: true,
  chain: true,
  network: true,
});

export const updateSchema = schema.pick({
  httpUrl: true,
  chain: true,
  network: true,
});

export type GoogleNodeEndpoint = z.infer<typeof schema>;
export type GoogleNodeEndpointNew = z.infer<typeof newSchema>;
export type GoogleNodeEndpointUpdate = z.infer<typeof updateSchema>;
