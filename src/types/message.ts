import type { ApplicationStatus } from "@/app/generated/prisma/enums";
import type { CampaignListItemDTO } from "./campaign";

export interface MessageSenderDTO {
  id: string;
  name: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  sender: MessageSenderDTO | null;
  message: string;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipantDTO {
  type: "BUSINESS" | "INFLUENCER";
  id: string; // The BusinessProfile id or InfluencerProfile id
  name: string; // Display name or Company name
  avatarUrl: string | null;
}

export interface ConversationListItemDTO {
  conversationId: string;
  applicationId: string;
  applicationStatus: ApplicationStatus;
  campaign: CampaignListItemDTO;
  otherParticipant: ConversationParticipantDTO;
  latestMessage: MessageDTO | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDetailDTO {
  conversationId: string;
  applicationId: string;
  applicationStatus: ApplicationStatus;
  campaign: CampaignListItemDTO;
  otherParticipant: ConversationParticipantDTO;
  createdAt: Date;
  updatedAt: Date;
}

// Responses
export interface ConversationListResponse {
  conversations: ConversationListItemDTO[];
}

export interface ConversationDetailResponse {
  conversation: ConversationDetailDTO;
}

export interface MessageListResponse {
  messages: MessageDTO[];
  total: number;
  page: number;
  limit: number;
}

export interface MessageResponse {
  message: MessageDTO;
}
