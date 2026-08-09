import type { InfluencerPublicProfileDTO } from "./influencer";
import type { CampaignListItemDTO } from "./campaign";

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
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
  campaign: CampaignListItemDTO;
  otherParticipant: ConversationParticipantDTO;
  latestMessage: MessageDTO | null;
  unreadCount: number;
}

export interface ConversationDetailDTO {
  conversationId: string;
  applicationId: string;
  campaign: CampaignListItemDTO;
  otherParticipant: ConversationParticipantDTO;
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
}

export interface MessageResponse {
  message: MessageDTO;
}
