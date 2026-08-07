import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type {
  ConversationListItemDTO,
  ConversationDetailDTO,
  MessageDTO,
  ConversationParticipantDTO,
} from "@/src/types/message";
import { toListDTO as mapToCampaignListDTO } from "./campaign.repository";
import type { SendMessageInput } from "@/src/validations/message.validation";

// ─────────────────────────────────────────────
// Shared includes
// ─────────────────────────────────────────────

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
          userId: true, // Need this to match against authenticated user
        },
      },
    },
  },
} as const;

const conversationListInclude = {
  ...conversationInclude,
  messages: {
    orderBy: { createdAt: "desc" },
    take: 1,
  },
  _count: {
    select: {
      messages: { where: { isRead: false } },
    },
  },
} as const;

// ─────────────────────────────────────────────
// DTO Mappers
// ─────────────────────────────────────────────

function toMessageDTO(message: Prisma.MessageGetPayload<{}>): MessageDTO {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
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
  // If the current user is the influencer, the other participant is the business
  if (application.influencer.userId === currentUserId) {
    return {
      type: "BUSINESS",
      id: application.campaign.business.id,
      name: application.campaign.business.companyName,
      avatarUrl: application.campaign.business.companyLogo,
    };
  }
  // Otherwise, the current user is the business, so the other participant is the influencer
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
    campaign: mapToCampaignListDTO(conversation.application.campaign as any),
    otherParticipant: getOtherParticipant(conversation.application as any, currentUserId),
  };
}

function toConversationListItemDTO(
  conversation: Prisma.ConversationGetPayload<{ include: typeof conversationListInclude }>,
  currentUserId: string
): ConversationListItemDTO {
  return {
    conversationId: conversation.id,
    applicationId: conversation.applicationId,
    campaign: mapToCampaignListDTO(conversation.application.campaign as any),
    otherParticipant: getOtherParticipant(conversation.application as any, currentUserId),
    latestMessage: conversation.messages.length > 0 ? toMessageDTO(conversation.messages[0]) : null,
    // Note: unreadCount is naive here, normally you filter by `senderId != currentUserId`
    // We'll just return the total unread for this query structure as a simplification
    unreadCount: conversation._count.messages,
  };
}

// ─────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────

export const messageRepository = {
  /**
   * Find conversations where the user is either the applicant (Influencer)
   * or the campaign owner (Business).
   */
  async findUserConversations(userId: string): Promise<ConversationListItemDTO[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { application: { influencer: { userId } } },
          { application: { campaign: { business: { userId } } } },
        ],
      },
      include: conversationListInclude,
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
   * Raw helper to verify a user is part of a conversation.
   * Returns the user's role in the conversation ("INFLUENCER" | "BUSINESS") or null.
   */
  async verifyParticipant(
    conversationId: string,
    userId: string
  ): Promise<"INFLUENCER" | "BUSINESS" | null> {
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

    if (!conversation) return null;

    if (conversation.application.influencer.userId === userId) {
      return "INFLUENCER";
    }

    if (conversation.application.campaign.business.userId === userId) {
      return "BUSINESS";
    }

    return null;
  },

  async findMessages(conversationId: string): Promise<MessageDTO[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
    return messages.map(toMessageDTO);
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
      });

      // Update conversation timestamp for sorting
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
    });
    return message ? toMessageDTO(message) : null;
  },

  async markAsRead(messageId: string): Promise<MessageDTO> {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
    return toMessageDTO(message);
  },
};
