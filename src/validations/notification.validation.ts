import { z } from "zod";
import { NotificationType } from "@/app/generated/prisma/enums";

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z.coerce.boolean().default(false),
  type: z.nativeEnum(NotificationType).optional(),
});

export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
