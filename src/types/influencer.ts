import type {
  Gender,
  Platform,
  ApplicationApprovalStatus,
} from "@/app/generated/prisma/enums";

export interface SocialAccountDTO {
  id: string;
  platform: Platform;
  username: string;
  profileUrl: string | null;
  followers: number;
  engagementRate: number;
}

export interface PortfolioItemDTO {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  url: string | null;
}

export interface InfluencerNicheDTO {
  id: string;
  name: string;
}

export interface InfluencerFormatDTO {
  id: string;
  name: string;
}

export interface InfluencerProfileDTO {
  id: string;
  userId: string;
  displayName: string;
  profilePhoto: string | null;
  bio: string | null;
  age: number | null;
  gender: Gender | null;
  country: string | null;
  state: string | null;
  city: string | null;
  ethnicity: string | null;
  previousBrands: string | null;
  applicationStatus: ApplicationApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
  socialAccounts: SocialAccountDTO[];
  contentNiches: InfluencerNicheDTO[];
  contentFormats: InfluencerFormatDTO[];
  portfolioItems: PortfolioItemDTO[];
}

/** Public-facing profile — excludes userId and internal fields */
export interface InfluencerPublicProfileDTO {
  id: string;
  displayName: string;
  profilePhoto: string | null;
  bio: string | null;
  age: number | null;
  gender: Gender | null;
  country: string | null;
  state: string | null;
  city: string | null;
  socialAccounts: SocialAccountDTO[];
  contentNiches: InfluencerNicheDTO[];
  contentFormats: InfluencerFormatDTO[];
  portfolioItems: PortfolioItemDTO[];
}

export interface InfluencerProfileResponse {
  profile: InfluencerProfileDTO;
}

export interface InfluencerPublicProfileResponse {
  profile: InfluencerPublicProfileDTO;
}
