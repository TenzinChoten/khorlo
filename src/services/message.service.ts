import { requireRole } from "@/src/lib/require-role";
import { businessRepository } from "@/src/repositories/business.repository";
import { messageRepository } from "@/src/repositories/message.repository";
import { notificationService } from "@/src/services/notification.service";
import { assertCanSendMessage } from "@/src/services/campaign-entitlement.service";
import {
  sendMessageSchema,
  messageListQuerySchema,
} from "@/src/validations/message.validation";
import type {
  ConversationListResponse,
  ConversationDetailResponse,
  MessageListResponse,
  MessageResponse,
} from "@/src/types/message";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "@/src/types";

function parseValidation<T>(
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } },
  body: unknown,
  message: string
): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(
      message,
      result.error.flatten().fieldErrors as Record<string, string[]>
    );
  }
  return result.data;
}

async function requireParticipant(conversationId: string, userId: string) {
  const access = await messageRepository.getConversationAccess(conversationId, userId);
  if (!access.exists) {
    throw new NotFoundError("Conversation not found.");
  }
  if (!access.role) {
    throw new ForbiddenError("You are not a participant in this conversation.");
  }
  return access;
}

export const messageService = {
  async getMyConversations(): Promise<ConversationListResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS");

    const conversations = await messageRepository.findUserConversations(user.id);

    return { conversations };
  },

  async getConversation(conversationId: string): Promise<ConversationDetailResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS");
    await requireParticipant(conversationId, user.id);

    const conversation = await messageRepository.findConversationById(conversationId, user.id);
    if (!conversation) {
      throw new NotFoundError("Conversation not found.");
    }

    return { conversation };
  },

  async getMessages(conversationId: string, queryParams: unknown): Promise<MessageListResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS");
    await requireParticipant(conversationId, user.id);

    const query = parseValidation(messageListQuerySchema, queryParams, "Invalid query parameters");

    // [Reason] Opening the thread marks the other party's unread messages as read for this user
    await messageRepository.markReceivedMessagesAsRead(conversationId, user.id);

    const { messages, total } = await messageRepository.findMessages(conversationId, query);

    return { messages, total, page: query.page, limit: query.limit };
  },

  async sendMessage(conversationId: string, body: unknown): Promise<MessageResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS");

    const data = parseValidation(sendMessageSchema, body, "Invalid message data");

    const access = await requireParticipant(conversationId, user.id);

    // [Reason] Messaging is only allowed after the application has been accepted
    if (access.applicationStatus !== "ACCEPTED") {
      throw new ConflictError("Messages can only be sent for accepted applications.");
    }

    // [Reason] Brand message volume is capped by the active plan; creators are not billed
    if (user.role === "BUSINESS") {
      const profile = await businessRepository.findByUserId(user.id);
      if (profile) {
        await assertCanSendMessage(profile.id, user.id);
      }
    }

    const message = await messageRepository.createMessage(conversationId, user.id, data);

    if (access.recipientUserId !== user.id) {
      const preview =
        data.message.length > 120 ? `${data.message.slice(0, 117)}...` : data.message;
      await notificationService.createNotification(
        access.recipientUserId,
        "New Message",
        `${user.name}: ${preview}`,
        "MESSAGE"
      );
    }

    return { message };
  },

  async markMessageAsRead(messageId: string): Promise<MessageResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS");

    const message = await messageRepository.findMessageById(messageId);
    if (!message) {
      throw new NotFoundError("Message not found.");
    }

    const access = await messageRepository.getConversationAccess(message.conversationId, user.id);
    if (!access.exists) {
      throw new NotFoundError("Conversation not found.");
    }
    if (!access.role) {
      throw new ForbiddenError("You are not a participant in this conversation.");
    }

    if (message.senderId === user.id) {
      throw new ForbiddenError("You cannot mark your own messages as read.");
    }

    const updatedMessage = await messageRepository.markAsRead(messageId);

    return { message: updatedMessage };
  },
};
