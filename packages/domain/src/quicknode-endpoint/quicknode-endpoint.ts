import { z } from "zod";

export const schema = z.object({
  id: z.string().uuid(),
  quicknodeId: z.string().min(1),
  endpointId: z.string().min(1),
  wssUrl: z.string().min(1),
  httpUrl: z.string().min(1),
  referers: z.array(z.string()).optional().nullable(),
  contractAddresses: z.array(z.string()),
  chain: z.string().min(1),
  network: z.string().min(1),
  plan: z.string().min(1),
  isTest: z.boolean().default(false).optional(),
  deprovisionAt: z.date().nullable(),
  deactivateAt: z.date().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const newSchema = schema.pick({
  quicknodeId: true,
  endpointId: true,
  wssUrl: true,
  httpUrl: true,
  referers: true,
  contractAddresses: true,
  chain: true,
  network: true,
  plan: true,
  isTest: true,
});

export const updateSchema = schema.pick({
  wssUrl: true,
  httpUrl: true,
  referers: true,
  contractAddresses: true,
  chain: true,
  network: true,
  plan: true,
  isTest: true,
  deactivateAt: true,
  deprovisionAt: true,
});

export type QuickNodeEndpoint = z.infer<typeof schema>;
export type QuickNodeEndpointNew = z.infer<typeof newSchema>;
export type QuickNodeEndpointUpdate = z.infer<typeof updateSchema>;
