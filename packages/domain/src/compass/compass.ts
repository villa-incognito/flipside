import { z } from "zod";

const compassApiKey = z.object({
  id: z.string(),
  apiKey: z.string(),
  hosts: z.array(z.string()).nullable(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

const compassError = z
  .object({
    errorType: z.string(),
    name: z.string(),
    msg: z.string(),
  })
  .nullable();

const compassUser = z.object({
  id: z.string(),
  externalUserId: z.string(),
  lagoSubscriptionId: z.string(),
  lagoCustomerId: z.string().nullable(),
  lagoPlanCode: z.string().nullable(),
  isPaidUser: z.boolean(),
  isDisabled: z.boolean(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const notificationType = z.object({
  id: z.string(),
  label: z.string(),
  title: z.string(),
  subject: z.string(),
  sgTemplateId: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const notificationTrigger = z.object({
  id: z.string(),
  userId: z.string(),
  threshold: z.string(),
  notificationTypeId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  notificationType: notificationType.nullable().optional(),
});

const notification = z.object({
  id: z.string(),
  notificationType: notificationType.nullable().optional(),
});

export const createApiResponseSchema = z.object({
  error: compassError,
  data: z
    .object({
      apiKey: compassApiKey,
      user: compassUser,
    })
    .nullable(),
});

export const getAllApiKeysResponseSchema = z.object({
  error: compassError,
  data: z
    .object({
      apiKeys: z.array(compassApiKey),
      lagoCustomerId: z.string().nullable(),
      lagoSubscriptionId: z.string(),
    })
    .nullable(),
});

export const deleteApiResponseSchema = z.object({
  error: compassError,
  data: z
    .object({
      apiKey: compassApiKey,
    })
    .nullable(),
});

export const upsertUserResponseSchema = z.object({
  error: compassError,
  data: z
    .object({
      user: compassUser,
    })
    .nullable(),
});

export const upsertUsageWarningResponseSchema = z.object({
  error: compassError,
  data: z
    .object({
      notificationTrigger,
    })
    .nullable(),
});

export const getAllTriggersResponseSchema = z.object({
  error: compassError,
  data: z
    .object({
      notificationTriggers: z.array(notificationTrigger),
    })
    .nullable(),
});

export const getAllNotificationsSchema = z.object({
  error: compassError,
  data: z
    .object({
      notifications: z.array(notification),
    })
    .nullable(),
});

export const dismissNotificationSchema = z.object({
  error: compassError,
  data: z
    .object({
      notification: z.object({ id: z.string() }),
    })
    .nullable(),
});

export type CompassApiKey = z.infer<typeof compassApiKey>;
export type CompassError = z.infer<typeof compassError>;
export type CompassUser = z.infer<typeof compassUser>;
export type Notification = z.infer<typeof notification>;
