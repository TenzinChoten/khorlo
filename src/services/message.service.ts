import { requireRole } from "@/src/lib/require-role";
import { messageRepository } from "@/src/repositories/message.repository";
import { notificationService } from "@/src/services/notification.service";
import { sendMessageSchema } from "@/src/validations/message.validation";
import { prisma } from "@/src/lib/prisma";
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

export const messageService = {
  async getMyConversations(): Promise<ConversationListResponse> {
    // Both INFLUENCER and BUSINESS can have conversations
    const user = await requireRole("INFLUENCER", "BUSINESS");

    const conversations = await messageRepository.findUserConversations(user.id);

    return { conversations };
  },

  async getConversation(conversationId: string): Promise<ConversationDetailResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS");

    // Verify participation
    const role = await messageRepository.verifyParticipant(conversationId, user.id);
    if (!role) {
      throw new ForbiddenError("You are not a participant in this conversation.");
    }

    const conversation = await messageRepository.findConversationById(conversationId, user.id);
    if (!conversation) {
      throw new NotFoundError("Conversation not found.");
    }

    return { conversation };
  },

  async getMessages(conversationId: string): Promise<MessageListResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS");

    // Verify participation
    const role = await messageRepository.verifyParticipant(conversationId, user.id);
    if (!role) {
      throw new ForbiddenError("You are not a participant in this conversation.");
    }

    const messages = await messageRepository.findMessages(conversationId);

    return { messages };
  },

  async sendMessage(conversationId: string, body: unknown): Promise<MessageResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS");

    const data = parseValidation(sendMessageSchema, body, "Invalid message data");

    // Verify participation
    const role = await messageRepository.verifyParticipant(conversationId, user.id);
    if (!role) {
      throw new ForbiddenError("You are not a participant in this conversation.");
    }

    // Creating conversation here is explicitly disallowed by requirements.
    // Conversations MUST already exist (created when application is ACCEPTED).

    const message = await messageRepository.createMessage(conversationId, user.id, data);

    // Notify Recipient
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        application: {
          include: {
            influencer: true,
            campaign: { include: { business: true } },
          },
        },
      },
    });

    if (conversation) {
      const recipientUserId =
        conversation.application.influencer.userId === user.id
          ? conversation.application.campaign.business.userId
          : conversation.application.influencer.userId;

      await notificationService.createNotification(
        recipientUserId,
        "New Message",
        "You have a new message.",
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

    // You can only mark a message as read if you are a participant in the conversation,
    // AND you are NOT the sender of the message.
    const role = await messageRepository.verifyParticipant(message.conversationId, user.id);
    if (!role) {
      throw new ForbiddenError("You are not a participant in this conversation.");
    }

    if (message.senderId === user.id) {
      throw new ForbiddenError("You cannot mark your own messages as read.");
    }

    const updatedMessage = await messageRepository.markAsRead(messageId);

    return { message: updatedMessage };
  },
};
