import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type {
  InfluencerProfileDTO,
  InfluencerPublicProfileDTO,
  SocialAccountDTO,
  PortfolioItemDTO,
  InfluencerNicheDTO,
  InfluencerFormatDTO,
} from "@/src/types/influencer";
import type {
  SocialAccountInput,
  PortfolioItemInput,
} from "@/src/validations/influencer.validation";
import type { Gender } from "@/app/generated/prisma/enums";

// ─────────────────────────────────────────────
// Shared selects / includes
// ─────────────────────────────────────────────

const socialAccountSelect = {
  id: true,
  platform: true,
  username: true,
  profileUrl: true,
  followers: true,
  engagementRate: true,
} as const;

const portfolioSelect = {
  id: true,
  title: true,
  description: true,
  thumbnail: true,
  url: true,
} as const;

const nicheSelect = {
  contentNiche: { select: { id: true, name: true } },
} as const;

const formatSelect = {
  contentFormat: { select: { id: true, name: true } },
} as const;

/** Include used when querying influencer profiles with all relations */
function profileInclude(userId: string) {
  return {
    contentNiches: { select: nicheSelect },
    contentFormats: { select: formatSelect },
    portfolioItems: { select: portfolioSelect },
    user: {
      select: {
        socialAccounts: {
          where: { userId },
          select: socialAccountSelect,
        },
      },
    },
  } as const;
}

// ─────────────────────────────────────────────
// DTO Mappers
// ─────────────────────────────────────────────

type RawProfile = Prisma.InfluencerProfileGetPayload<{
  include: ReturnType<typeof profileInclude>;
}>;

function mapSocialAccounts(
  accounts: { id: string; platform: string; username: string; profileUrl: string | null; followers: number; engagementRate: number }[]
): SocialAccountDTO[] {
  return accounts as SocialAccountDTO[];
}

function mapNiches(niches: RawProfile["contentNiches"]): InfluencerNicheDTO[] {
  return niches.map((n) => ({
    id: n.contentNiche.id,
    name: n.contentNiche.name,
  }));
}

function mapFormats(formats: RawProfile["contentFormats"]): InfluencerFormatDTO[] {
  return formats.map((f) => ({
    id: f.contentFormat.id,
    name: f.contentFormat.name,
  }));
}

function mapPortfolio(items: RawProfile["portfolioItems"]): PortfolioItemDTO[] {
  return items as PortfolioItemDTO[];
}

function toFullDTO(raw: RawProfile): InfluencerProfileDTO {
  return {
    id: raw.id,
    userId: raw.userId,
    displayName: raw.displayName,
    profilePhoto: raw.profilePhoto,
    bio: raw.bio,
    age: raw.age,
    gender: raw.gender,
    country: raw.country,
    state: raw.state,
    city: raw.city,
    ethnicity: raw.ethnicity,
    previousBrands: raw.previousBrands,
    applicationStatus: raw.applicationStatus,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    socialAccounts: mapSocialAccounts(raw.user.socialAccounts),
    contentNiches: mapNiches(raw.contentNiches),
    contentFormats: mapFormats(raw.contentFormats),
    portfolioItems: mapPortfolio(raw.portfolioItems),
  };
}

export function toPublicDTO(raw: RawProfile): InfluencerPublicProfileDTO {
  return {
    id: raw.id,
    displayName: raw.displayName,
    profilePhoto: raw.profilePhoto,
    bio: raw.bio,
    age: raw.age,
    gender: raw.gender,
    country: raw.country,
    state: raw.state,
    city: raw.city,
    socialAccounts: mapSocialAccounts(raw.user.socialAccounts),
    contentNiches: mapNiches(raw.contentNiches),
    contentFormats: mapFormats(raw.contentFormats),
    portfolioItems: mapPortfolio(raw.portfolioItems),
  };
}

// ─────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────

export const influencerRepository = {
  async findByUserId(userId: string): Promise<InfluencerProfileDTO | null> {
    const profile = await prisma.influencerProfile.findUnique({
      where: { userId },
      include: profileInclude(userId),
    });
    return profile ? toFullDTO(profile) : null;
  },

  async findByIdPublic(id: string): Promise<InfluencerPublicProfileDTO | null> {
    const profile = await prisma.influencerProfile.findUnique({
      where: { id },
      include: {
        contentNiches: { select: nicheSelect },
        contentFormats: { select: formatSelect },
        portfolioItems: { select: portfolioSelect },
        user: {
          select: {
            socialAccounts: { select: socialAccountSelect },
          },
        },
      },
    });
    return profile ? toPublicDTO(profile) : null;
  },

  async create(
    userId: string,
    data: {
      displayName: string;
      profilePhoto?: string;
      bio?: string;
      age?: number;
      gender?: Gender;
      country?: string;
      state?: string;
      city?: string;
      ethnicity?: string;
      previousBrands?: string;
    },
    relations: {
      socialAccounts?: SocialAccountInput[];
      nicheIds: string[];
      formatIds: string[];
      portfolio?: PortfolioItemInput[];
    }
  ): Promise<InfluencerProfileDTO> {
    const profile = await prisma.$transaction(async (tx) => {
      // Create the profile
      const created = await tx.influencerProfile.create({
        data: {
          ...data,
          userId,
          contentNiches: relations.nicheIds.length
            ? { create: relations.nicheIds.map((id) => ({ contentNicheId: id })) }
            : undefined,
          contentFormats: relations.formatIds.length
            ? { create: relations.formatIds.map((id) => ({ contentFormatId: id })) }
            : undefined,
          portfolioItems: relations.portfolio?.length
            ? {
                create: relations.portfolio.map((p) => ({
                  title: p.title,
                  description: p.description,
                  thumbnail: p.thumbnailUrl,
                  url: p.mediaUrl,
                })),
              }
            : undefined,
        },
      });

      // Create social accounts (belong to User, not InfluencerProfile)
      if (relations.socialAccounts?.length) {
        await tx.socialAccount.createMany({
          data: relations.socialAccounts.map((sa) => ({
            userId,
            platform: sa.platform,
            username: sa.username,
            profileUrl: sa.url,
            followers: sa.followers,
            engagementRate: sa.engagementRate,
          })),
        });
      }

      // Re-fetch with all includes
      return tx.influencerProfile.findUniqueOrThrow({
        where: { id: created.id },
        include: profileInclude(userId),
      });
    });

    return toFullDTO(profile);
  },

  async update(
    userId: string,
    profileId: string,
    data: {
      fields: Prisma.InfluencerProfileUpdateInput;
      socialAccounts?: SocialAccountInput[];
      nicheIds?: string[];
      formatIds?: string[];
      portfolio?: PortfolioItemInput[];
    }
  ): Promise<InfluencerProfileDTO> {
    const profile = await prisma.$transaction(async (tx) => {
      // Replace social accounts if supplied
      if (data.socialAccounts !== undefined) {
        await tx.socialAccount.deleteMany({ where: { userId } });
        if (data.socialAccounts.length > 0) {
          await tx.socialAccount.createMany({
            data: data.socialAccounts.map((sa) => ({
              userId,
              platform: sa.platform,
              username: sa.username,
              profileUrl: sa.url,
              followers: sa.followers,
              engagementRate: sa.engagementRate,
            })),
          });
        }
      }

      // Replace niches if supplied
      if (data.nicheIds !== undefined) {
        await tx.influencerContentNiche.deleteMany({
          where: { influencerId: profileId },
        });
        if (data.nicheIds.length > 0) {
          await tx.influencerContentNiche.createMany({
            data: data.nicheIds.map((nicheId) => ({
              influencerId: profileId,
              contentNicheId: nicheId,
            })),
          });
        }
      }

      // Replace formats if supplied
      if (data.formatIds !== undefined) {
        await tx.influencerContentFormat.deleteMany({
          where: { influencerId: profileId },
        });
        if (data.formatIds.length > 0) {
          await tx.influencerContentFormat.createMany({
            data: data.formatIds.map((formatId) => ({
              influencerId: profileId,
              contentFormatId: formatId,
            })),
          });
        }
      }

      // Replace portfolio if supplied
      if (data.portfolio !== undefined) {
        await tx.portfolio.deleteMany({
          where: { influencerId: profileId },
        });
        if (data.portfolio.length > 0) {
          await tx.portfolio.createMany({
            data: data.portfolio.map((p) => ({
              influencerId: profileId,
              title: p.title,
              description: p.description,
              thumbnail: p.thumbnailUrl,
              url: p.mediaUrl,
            })),
          });
        }
      }

      // Update profile fields
      return tx.influencerProfile.update({
        where: { id: profileId },
        data: data.fields,
        include: profileInclude(userId),
      });
    });

    return toFullDTO(profile);
  },
};
