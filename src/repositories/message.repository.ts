import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { ApplicationStatus } from "@/app/generated/prisma/enums";
import type {
  ConversationListItemDTO,
  ConversationDetailDTO,
  MessageDTO,
  ConversationParticipantDTO,
} from "@/src/types/message";
import { toListDTO as mapToCampaignListDTO } from "./campaign.repository";
import type { SendMessageInput, MessageListQueryInput } from "@/src/validations/message.validation";

export type ConversationAccess =
  | { exists: false }
  | {
      exists: true;
      role: "INFLUENCER" | "BUSINESS" | null;
      applicationStatus: ApplicationStatus;
      recipientUserId: string;
    };

const senderSelect = {
  id: true,
  name: true,
} as const;

const businessSelect = {
  id: true,
  companyName: true,
  companyLogo: true,
  isVerified: true,
} as const;

const campaignSelect = {
  business: { select: businessSelect },
  contentNiches: { select: { contentNiche: { select: { id: true, name: true } } } },
  contentFormats: { select: { quantity: true, contentFormat: { select: { id: true, name: true } } } },
} as const;

const conversationInclude = {
  application: {
    include: {
      campaign: { include: campaignSelect },
      influencer: {
        select: {
          id: true,
          displayName: true,
          profilePhoto: true,
          userId: true,
        },
      },
    },
  },
} as const;

function conversationListInclude(currentUserId: string) {
  return {
    ...conversationInclude,
    messages: {
      orderBy: { createdAt: "desc" as const },
      take: 1,
      include: { sender: { select: senderSelect } },
    },
    // [Reason] Unread badge should only count messages the current user still needs to read
    _count: {
      select: {
        messages: {
          where: { isRead: false, senderId: { not: currentUserId } },
        },
      },
    },
  };
}

const messageWithSenderInclude = {
  sender: { select: senderSelect },
} as const;

type MessageWithSender = Prisma.MessageGetPayload<{ include: typeof messageWithSenderInclude }>;

function toMessageDTO(message: MessageWithSender | Prisma.MessageGetPayload<{}>): MessageDTO {
  const sender =
    "sender" in message && message.sender
      ? { id: message.sender.id, name: message.sender.name }
      : null;

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    sender,
    message: message.message,
    attachmentUrl: message.attachmentUrl,
    isRead: message.isRead,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

function getOtherParticipant(
  application: Prisma.ApplicationGetPayload<{ include: { campaign: { include: typeof campaignSelect }, influencer: true } }>,
  currentUserId: string
): ConversationParticipantDTO {
  if (application.influencer.userId === currentUserId) {
    return {
      type: "BUSINESS",
      id: application.campaign.business.id,
      name: application.campaign.business.companyName,
      avatarUrl: application.campaign.business.companyLogo,
    };
  }
  return {
    type: "INFLUENCER",
    id: application.influencer.id,
    name: application.influencer.displayName,
    avatarUrl: application.influencer.profilePhoto,
  };
}

function toConversationDetailDTO(
  conversation: Prisma.ConversationGetPayload<{ include: typeof conversationInclude }>,
  currentUserId: string
): ConversationDetailDTO {
  return {
    conversationId: conversation.id,
    applicationId: conversation.applicationId,
    applicationStatus: conversation.application.status,
    campaign: mapToCampaignListDTO(conversation.application.campaign as any),
    otherParticipant: getOtherParticipant(conversation.application as any, currentUserId),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

function toConversationListItemDTO(
  conversation: Prisma.ConversationGetPayload<{ include: ReturnType<typeof conversationListInclude> }>,
  currentUserId: string
): ConversationListItemDTO {
  return {
    conversationId: conversation.id,
    applicationId: conversation.applicationId,
    applicationStatus: conversation.application.status,
    campaign: mapToCampaignListDTO(conversation.application.campaign as any),
    otherParticipant: getOtherParticipant(conversation.application as any, currentUserId),
    latestMessage: conversation.messages.length > 0 ? toMessageDTO(conversation.messages[0]) : null,
    unreadCount: conversation._count.messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export const messageRepository = {
  async findUserConversations(userId: string): Promise<ConversationListItemDTO[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { application: { influencer: { userId } } },
          { application: { campaign: { business: { userId } } } },
        ],
      },
      include: conversationListInclude(userId),
      orderBy: { updatedAt: "desc" },
    });

    return conversations.map((c) => toConversationListItemDTO(c as any, userId));
  },

  async findConversationById(
    conversationId: string,
    currentUserId: string
  ): Promise<ConversationDetailDTO | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: conversationInclude,
    });

    return conversation ? toConversationDetailDTO(conversation as any, currentUserId) : null;
  },

  /**
   * Resolves whether a conversation exists and whether the user is a participant.
   * Receiver is the other of: influencer applicant vs campaign business owner.
   */
  async getConversationAccess(
    conversationId: string,
    userId: string
  ): Promise<ConversationAccess> {
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

    if (!conversation) return { exists: false };

    const influencerUserId = conversation.application.influencer.userId;
    const businessUserId = conversation.application.campaign.business.userId;

    let role: "INFLUENCER" | "BUSINESS" | null = null;
    if (userId === influencerUserId) role = "INFLUENCER";
    else if (userId === businessUserId) role = "BUSINESS";

    return {
      exists: true,
      role,
      applicationStatus: conversation.application.status,
      recipientUserId: userId === influencerUserId ? businessUserId : influencerUserId,
    };
  },

  async verifyParticipant(
    conversationId: string,
    userId: string
  ): Promise<"INFLUENCER" | "BUSINESS" | null> {
    const access = await this.getConversationAccess(conversationId, userId);
    if (!access.exists) return null;
    return access.role;
  },

  async findMessages(
    conversationId: string,
    query: MessageListQueryInput
  ): Promise<{ messages: MessageDTO[]; total: number }> {
    const where = { conversationId };
    const [items, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: messageWithSenderInclude,
        // [Reason] Chat UIs page from newest; reverse so the client can render oldest-to-newest
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.message.count({ where }),
    ]);

    return { messages: items.reverse().map(toMessageDTO), total };
  },

  async createMessage(
    conversationId: string,
    senderId: string,
    data: SendMessageInput
  ): Promise<MessageDTO> {
    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId,
          message: data.message,
          attachmentUrl: data.attachmentUrl,
        },
        include: messageWithSenderInclude,
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return msg;
    });

    return toMessageDTO(message);
  },

  async findMessageById(messageId: string): Promise<MessageDTO | null> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: messageWithSenderInclude,
    });
    return message ? toMessageDTO(message) : null;
  },

  async markAsRead(messageId: string): Promise<MessageDTO> {
    const message = await prisma.message.update({
      where: { id: messageId },
      include: messageWithSenderInclude,
      data: { isRead: true },
    });
    return toMessageDTO(message);
  },

  async countSentByUserSince(userId: string, since: Date): Promise<number> {
    return prisma.message.count({
      where: {
        senderId: userId,
        createdAt: { gte: since },
      },
    });
  },

  async markReceivedMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
  },
};
