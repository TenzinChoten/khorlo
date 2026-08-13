import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type {
  ApplicationDTO,
  ApplicationWithCampaignDTO,
  ApplicationWithInfluencerDTO,
  ApplicationDetailDTO,
} from "@/src/types/application";
import type { UpdateApplicationStatusInput } from "@/src/validations/application.validation";
import { ConflictError } from "@/src/types";
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

const conversationSelect = {
  conversation: { select: { id: true } },
} as const;

const withCampaignInclude = {
  campaign: { include: campaignSelect },
  ...conversationSelect,
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
  },
  ...conversationSelect,
} as const;

const detailInclude = {
  ...withCampaignInclude,
  ...withInfluencerInclude,
} as const;

// ─────────────────────────────────────────────
// DTO Mappers
// ─────────────────────────────────────────────

type ApplicationRecord = Prisma.ApplicationGetPayload<{}> & {
  conversation?: { id: string } | null;
};

function toBaseDTO(application: ApplicationRecord): ApplicationDTO {
  return {
    id: application.id,
    campaignId: application.campaignId,
    influencerId: application.influencerId,
    coverLetter: application.coverLetter,
    status: application.status,
    // [Reason] Frontend deep-links into the existing conversation instead of creating one
    conversationId: application.conversation?.id ?? null,
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

  async countByCampaignStatus(
    campaignId: string,
    status: ApplicationDTO["status"]
  ): Promise<number> {
    return prisma.application.count({
      where: { campaignId, status },
    });
  },

  async updateStatus(
    id: string,
    data: UpdateApplicationStatusInput,
    slotCheck?: { campaignId: string; creatorSlots: number }
  ): Promise<ApplicationDTO> {
    const application = await prisma.$transaction(async (tx) => {
      // [Reason] Lock the campaign so two accepts cannot fill more slots than creatorSlots allows
      if (data.status === "ACCEPTED" && slotCheck) {
        await tx.$queryRaw`
          SELECT id FROM "Campaign" WHERE id = ${slotCheck.campaignId} FOR UPDATE
        `;
        const acceptedCount = await tx.application.count({
          where: { campaignId: slotCheck.campaignId, status: "ACCEPTED" },
        });
        if (acceptedCount >= slotCheck.creatorSlots) {
          throw new ConflictError(
            `All ${slotCheck.creatorSlots} creator slot${slotCheck.creatorSlots === 1 ? "" : "s"} for this campaign are filled.`
          );
        }
      }

      const updated = await tx.application.update({
        where: { id },
        data: { status: data.status },
      });

      // [Reason] One accepted application must have exactly one conversation; skip if it already exists
      let conversation: { id: string } | null = null;
      if (data.status === "ACCEPTED") {
        const existing = await tx.conversation.findUnique({
          where: { applicationId: id },
          select: { id: true },
        });

        conversation = existing
          ? existing
          : await tx.conversation.create({
              data: { applicationId: id },
              select: { id: true },
            });
      }

      return { ...updated, conversation };
    });

    return toBaseDTO(application);
  },

  async delete(id: string): Promise<void> {
    await prisma.application.delete({
      where: { id },
    });
  },
};
