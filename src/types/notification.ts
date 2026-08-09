import type { NotificationType } from "@/app/generated/prisma/enums";

export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationListResponse {
  notifications: NotificationDTO[];
  total: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationResponse {
  notification: NotificationDTO;
}
