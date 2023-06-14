import { z } from "zod";

export const schema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  fileSizeBytes: z.number(),
  metadata: z.any(),
  provider: z.string(),
  url: z.string().url(),
  createdById: z.string().uuid(),
  updatedById: z.string().uuid(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const newSchema = schema.pick({
  fileName: true,
  fileSizeBytes: true,
  metadata: true,
  provider: true,
  url: true,
});

export type FileUpload = z.infer<typeof schema>;
export type FileUploadNew = z.infer<typeof newSchema>;
