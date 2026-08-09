import { requireRole } from "@/src/lib/require-role";
import { notificationRepository } from "@/src/repositories/notification.repository";
import { notificationQuerySchema } from "@/src/validations/notification.validation";
import type { NotificationType } from "@/app/generated/prisma/enums";
import type {
  NotificationListResponse,
  UnreadCountResponse,
  NotificationResponse,
} from "@/src/types/notification";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "@/src/types";

function parseValidation<T>(
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } },
  query: unknown,
  message: string
): T {
  const result = schema.safeParse(query);
  if (!result.success) {
    throw new ValidationError(
      message,
      result.error.flatten().fieldErrors as Record<string, string[]>
    );
  }
  return result.data;
}

export const notificationService = {
  /**
   * Internal helper for other services to trigger a notification.
   * This is NOT called directly by API routes.
   */
  async createNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType
  ): Promise<void> {
    await notificationRepository.create({
      userId,
      title,
      body,
      type,
    });
  },

  async getMyNotifications(queryParams: unknown): Promise<NotificationListResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS", "ADMIN");
    const query = parseValidation(notificationQuerySchema, queryParams, "Invalid query parameters");

    const { items, total } = await notificationRepository.findUserNotifications(user.id, query);

    return { notifications: items, total };
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS", "ADMIN");
    const count = await notificationRepository.countUnread(user.id);
    
    return { count };
  },

  async markAsRead(id: string): Promise<NotificationResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS", "ADMIN");

    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundError("Notification not found.");
    }

    if (notification.userId !== user.id) {
      throw new ForbiddenError("You cannot update this notification.");
    }

    const updated = await notificationRepository.markAsRead(id);
    return { notification: updated };
  },

  async markAllAsRead(): Promise<void> {
    const user = await requireRole("INFLUENCER", "BUSINESS", "ADMIN");
    await notificationRepository.markAllAsRead(user.id);
  },

  async deleteNotification(id: string): Promise<void> {
    const user = await requireRole("INFLUENCER", "BUSINESS", "ADMIN");

    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundError("Notification not found.");
    }

    if (notification.userId !== user.id) {
      throw new ForbiddenError("You cannot delete this notification.");
    }

    await notificationRepository.delete(id);
  },
};
