import type {
  CompensationType,
  LocationType,
  CampaignStatus,
  CampaignImageType,
} from "@/app/generated/prisma/enums";

export interface CampaignImageDTO {
  id: string;
  imageUrl: string;
  imageType: CampaignImageType;
  caption: string | null;
  sortOrder: number;
}

export interface CampaignNicheDTO {
  id: string;
  name: string;
}

export interface CampaignFormatDTO {
  id: string;
  name: string;
  quantity: number;
}

export interface CampaignBusinessDTO {
  id: string;
  companyName: string;
  companyLogo: string | null;
  isVerified: boolean;
}

export interface CampaignListItemDTO {
  id: string;
  title: string;
  description: string;
  compensationType: CompensationType;
  budget: number | null;
  currency: string | null;
  locationType: LocationType;
  country: string | null;
  state: string | null;
  city: string | null;
  status: CampaignStatus;
  applicationDeadline: Date | null;
  creatorSlots: number;
  createdAt: Date;
  business: CampaignBusinessDTO;
  contentNiches: CampaignNicheDTO[];
  contentFormats: CampaignFormatDTO[];
  // [Reason] Discovery cards already show brand/logo images from the live list endpoint
  images: CampaignImageDTO[];
}

export interface CampaignDetailDTO extends CampaignListItemDTO {
  productName: string | null;
  contentDeadline: Date | null;
  address: string | null;
  updatedAt: Date;
  // [Reason] Public detail UI needs filled-slot counts without exposing application rows
  acceptedCount: number;
}

export interface CampaignListResponse {
  items: CampaignListItemDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignDetailResponse {
  campaign: CampaignDetailDTO;
}
