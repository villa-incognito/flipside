import { z } from "zod";

const role = z.enum(["standard", "internal", "cantina"]);

const usernameRegex = /^[a-zA-Z0-9-_]+$/;

export const schema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  role: role.default("standard"),
  username: z
    .string()
    .min(3, "Must be a minimum of 3 characters")
    .max(42, "Must be a maximum of 42 characters")
    .regex(usernameRegex, "Must be alphanumeric, hyphen, or underscore"),
  avatarId: z.string().uuid().nullable(),
  auth0UserId: z.string().nullable(),
  auth0Tenant: z.string().nullable(),
  backgroundImageId: z.string().uuid().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  avatarUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  ethAddress: z.string().nullable(),
  rank: z.number().nullable(),
  //allow empty string to clear handle
  twitterHandle: z
    .string()
    .regex(/^([a-zA-Z0-9_]{3,15})?$/)
    .nullable(),
  telegramHandle: z
    .string()
    .regex(/^([a-zA-Z0-9_]{5,32})?$/)
    .nullable(),
  discordHandle: z
    .string()
    .regex(/^(([\s\S]{2,32})#([0-9]{4}))?$/)
    .nullable(),
  stripeId: z.string().optional().nullable(),
  lagoSubscriptionId: z.string().optional().nullable(),
  quicknodeId: z.string().optional().nullable(),
});

export const displaySchema = schema
  .pick({
    id: true,
    username: true,
    avatarUrl: true,
    backgroundImageUrl: true,
  })
  .partial();

export const updateSchema = schema
  .pick({
    username: true,
    twitterHandle: true,
    discordHandle: true,
    telegramHandle: true,
    avatarId: true,
    backgroundImageId: true,
    stripeId: true,
    lagoSubscriptionId: true,
    quicknodeId: true,
    email: true,
    auth0UserId: true,
  })
  .partial();

export const createSchema = schema.pick({
  username: true,
  email: true,
  quicknodeId: true,
});

export const usernameSchema = schema
  .pick({
    username: true,
  })
  .partial();

export type User = z.infer<typeof schema>;
export type UserUpdate = z.infer<typeof updateSchema>;
export type UserCreate = z.infer<typeof createSchema>;
export type UserDisplay = z.infer<typeof displaySchema>;
