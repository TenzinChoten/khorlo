import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { NotificationType } from "@/app/generated/prisma/enums";
import type { NotificationDTO } from "@/src/types/notification";
import type { NotificationQueryInput } from "@/src/validations/notification.validation";

// ─────────────────────────────────────────────
// DTO Mappers
// ─────────────────────────────────────────────

function toDTO(notification: Prisma.NotificationGetPayload<{}>): NotificationDTO {
  return {
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

// ─────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────

export const notificationRepository = {
  async create(data: {
    userId: string;
    title: string;
    body: string;
    type: NotificationType;
  }): Promise<NotificationDTO> {
    const notification = await prisma.notification.create({
      data,
    });
    return toDTO(notification);
  },

  async findUserNotifications(
    userId: string,
    query: NotificationQueryInput
  ): Promise<{ items: NotificationDTO[]; total: number }> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.unreadOnly ? { isRead: false } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { items: items.map(toDTO), total };
  },

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  async findById(id: string): Promise<NotificationDTO | null> {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    return notification ? toDTO(notification) : null;
  },

  async markAsRead(id: string): Promise<NotificationDTO> {
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return toDTO(notification);
  },

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id },
    });
  },
};
