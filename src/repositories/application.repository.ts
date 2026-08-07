import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type {
  ApplicationDTO,
  ApplicationWithCampaignDTO,
  ApplicationWithInfluencerDTO,
  ApplicationDetailDTO,
} from "@/src/types/application";
import type { UpdateApplicationStatusInput } from "@/src/validations/application.validation";
import { toListDTO as mapToCampaignListDTO } from "./campaign.repository";
import { toPublicDTO as mapToInfluencerPublicDTO } from "./influencer.repository";

// ─────────────────────────────────────────────
// Shared includes
// ─────────────────────────────────────────────

// Re-declare or reference the includes from campaign/influencer.
// To keep it simple and type-safe, we define the exact include shape needed
// by the exported mappers in the other repositories.

// We need the same include structures that `toListDTO` and `toPublicDTO` expect.
// However, since those types are internal to those repositories, we'll have to
// redefine the select object here for the query, but we cast it or we ensure 
// Prisma infers it correctly.

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

const influencerSelect = {
  contentNiches: { select: { contentNiche: { select: { id: true, name: true } } } },
  contentFormats: { select: { contentFormat: { select: { id: true, name: true } } } },
  portfolioItems: { select: { id: true, title: true, description: true, thumbnail: true, url: true } },
} as const;

const withCampaignInclude = {
  campaign: { include: campaignSelect },
} as const;

const withInfluencerInclude = {
  influencer: {
    include: {
      ...influencerSelect,
      user: {
        select: {
          socialAccounts: {
            select: { id: true, platform: true, username: true, profileUrl: true, followers: true, engagementRate: true }
          }
        }
      }
    }
  }
} as const;

const detailInclude = {
  ...withCampaignInclude,
  ...withInfluencerInclude,
} as const;

// ─────────────────────────────────────────────
// DTO Mappers
// ─────────────────────────────────────────────

function toBaseDTO(application: Prisma.ApplicationGetPayload<{}>): ApplicationDTO {
  return {
    id: application.id,
    campaignId: application.campaignId,
    influencerId: application.influencerId,
    coverLetter: application.coverLetter,
    status: application.status,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}

function toWithCampaignDTO(
  application: Prisma.ApplicationGetPayload<{ include: typeof withCampaignInclude }>
): ApplicationWithCampaignDTO {
  return {
    ...toBaseDTO(application),
    // We cast to any here to satisfy the internal RawListItem type expected by mapToCampaignListDTO,
    // since we manually rebuilt the exact same include shape above.
    campaign: mapToCampaignListDTO(application.campaign as any),
  };
}

function toWithInfluencerDTO(
  application: Prisma.ApplicationGetPayload<{ include: typeof withInfluencerInclude }>
): ApplicationWithInfluencerDTO {
  return {
    ...toBaseDTO(application),
    influencer: mapToInfluencerPublicDTO(application.influencer as any),
  };
}

function toDetailDTO(
  application: Prisma.ApplicationGetPayload<{ include: typeof detailInclude }>
): ApplicationDetailDTO {
  return {
    ...toBaseDTO(application),
    campaign: mapToCampaignListDTO(application.campaign as any),
    influencer: mapToInfluencerPublicDTO(application.influencer as any),
  };
}

// ─────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────

export const applicationRepository = {
  async create(data: {
    campaignId: string;
    influencerId: string;
    coverLetter?: string;
  }): Promise<ApplicationDTO> {
    const application = await prisma.application.create({
      data,
    });
    return toBaseDTO(application);
  },

  async findByInfluencerId(influencerId: string): Promise<ApplicationWithCampaignDTO[]> {
    const applications = await prisma.application.findMany({
      where: { influencerId },
      include: withCampaignInclude,
      orderBy: { createdAt: "desc" },
    });
    return applications.map(toWithCampaignDTO);
  },

  async findByCampaignId(campaignId: string): Promise<ApplicationWithInfluencerDTO[]> {
    const applications = await prisma.application.findMany({
      where: { campaignId },
      include: withInfluencerInclude,
      orderBy: { createdAt: "desc" },
    });
    return applications.map(toWithInfluencerDTO);
  },

  async findById(id: string): Promise<ApplicationDetailDTO | null> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: detailInclude,
    });
    return application ? toDetailDTO(application) : null;
  },

  async checkExists(campaignId: string, influencerId: string): Promise<boolean> {
    const count = await prisma.application.count({
      where: { campaignId, influencerId },
    });
    return count > 0;
  },

  async updateStatus(
    id: string,
    data: UpdateApplicationStatusInput
  ): Promise<ApplicationDTO> {
    const application = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: { status: data.status },
      });

      if (data.status === "ACCEPTED") {
        // Create conversation if it doesn't exist
        const existing = await tx.conversation.findUnique({
          where: { applicationId: id },
        });

        if (!existing) {
          await tx.conversation.create({
            data: { applicationId: id },
          });
        }
      }

      return updated;
    });

    return toBaseDTO(application);
  },

  async delete(id: string): Promise<void> {
    await prisma.application.delete({
      where: { id },
    });
  },
};
