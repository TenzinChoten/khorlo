import type { ApplicationStatus } from "@/app/generated/prisma/enums";
import type { InfluencerPublicProfileDTO } from "./influencer";
import type { CampaignListItemDTO } from "./campaign";

export interface ApplicationDTO {
  id: string;
  campaignId: string;
  influencerId: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationWithCampaignDTO extends ApplicationDTO {
  campaign: CampaignListItemDTO;
}

export interface ApplicationWithInfluencerDTO extends ApplicationDTO {
  influencer: InfluencerPublicProfileDTO;
}

export interface ApplicationDetailDTO extends ApplicationDTO {
  campaign: CampaignListItemDTO;
  influencer: InfluencerPublicProfileDTO;
}

export interface ApplicationResponse {
  application: ApplicationDTO;
}

export interface ApplicationWithCampaignResponse {
  application: ApplicationWithCampaignDTO;
}

export interface ApplicationDetailResponse {
  application: ApplicationDetailDTO;
}

export interface ApplicationListMeResponse {
  applications: ApplicationWithCampaignDTO[];
}

export interface ApplicationListCampaignResponse {
  applications: ApplicationWithInfluencerDTO[];
}
