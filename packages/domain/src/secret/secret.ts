import { z } from "zod";

// export const secretTypeSchema = z.union([
//   z.literal("user"),
// ]);

export const schema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/, "Key can only contain letters, numbers, underscores, and hyphens"),
  key: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/, "Key can only contain letters, numbers, underscores, and hyphens"),
  value: z.string().min(1),
  type: z.string().min(1).default("user"),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  createdById: z.string().uuid(),
  updatedById: z.string().uuid(),
});

export const newSchema = schema.pick({
  name: true,
  key: true,
  value: true,
});

export const updateSchema = schema.pick({
  name: true,
  key: true,
  value: true,
});

export type Secret = z.infer<typeof schema>;
export type SecretNew = z.infer<typeof newSchema>;
export type SecretUpdate = z.infer<typeof updateSchema>;
