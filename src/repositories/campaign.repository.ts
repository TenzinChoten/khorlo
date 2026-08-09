import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type {
  CompensationType,
  LocationType,
  CampaignStatus,
} from "@/app/generated/prisma/enums";
import type {
  CampaignListItemDTO,
  CampaignDetailDTO,
  CampaignFormatDTO,
} from "@/src/types/campaign";
import type { CampaignQueryInput } from "@/src/validations/campaign.validation";

// ─────────────────────────────────────────────
// Shared includes
// ─────────────────────────────────────────────

const businessSelect = {
  id: true,
  companyName: true,
  companyLogo: true,
  isVerified: true,
} as const;

const nicheSelect = {
  contentNiche: { select: { id: true, name: true } },
} as const;

const formatSelect = {
  quantity: true,
  contentFormat: { select: { id: true, name: true } },
} as const;

const listInclude = {
  business: { select: businessSelect },
  contentNiches: { select: nicheSelect },
  contentFormats: { select: formatSelect },
} as const;

const detailInclude = {
  ...listInclude,
  images: {
    select: {
      id: true,
      imageUrl: true,
      imageType: true,
      caption: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

// ─────────────────────────────────────────────
// DTO Mappers
// ─────────────────────────────────────────────

type RawListItem = Prisma.CampaignGetPayload<{ include: typeof listInclude }>;
type RawDetail = Prisma.CampaignGetPayload<{ include: typeof detailInclude }>;

function mapNiches(
  niches: RawListItem["contentNiches"]
): { id: string; name: string }[] {
  return niches.map((n) => ({
    id: n.contentNiche.id,
    name: n.contentNiche.name,
  }));
}

function mapFormats(
  formats: RawListItem["contentFormats"]
): CampaignFormatDTO[] {
  return formats.map((f) => ({
    id: f.contentFormat.id,
    name: f.contentFormat.name,
    quantity: f.quantity,
  }));
}

export function toListDTO(campaign: RawListItem): CampaignListItemDTO {
  return {
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    compensationType: campaign.compensationType,
    budget: campaign.budget,
    currency: campaign.currency,
    locationType: campaign.locationType,
    country: campaign.country,
    state: campaign.state,
    city: campaign.city,
    status: campaign.status,
    applicationDeadline: campaign.applicationDeadline,
    creatorSlots: campaign.creatorSlots,
    createdAt: campaign.createdAt,
    business: campaign.business,
    contentNiches: mapNiches(campaign.contentNiches),
    contentFormats: mapFormats(campaign.contentFormats),
  };
}

function toDetailDTO(campaign: RawDetail): CampaignDetailDTO {
  return {
    ...toListDTO(campaign),
    productName: campaign.productName,
    contentDeadline: campaign.contentDeadline,
    address: campaign.address,
    updatedAt: campaign.updatedAt,
    images: campaign.images,
  };
}

// ─────────────────────────────────────────────
// Sort mapping
// ─────────────────────────────────────────────

const SORT_MAP: Record<
  string,
  Prisma.CampaignOrderByWithRelationInput
> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  budget_asc: { budget: "asc" },
  budget_desc: { budget: "desc" },
};

// ─────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────

export const campaignRepository = {
  /**
   * Find many campaigns with filters, pagination, and sorting.
   */
  async findMany(
    query: CampaignQueryInput
  ): Promise<{ items: CampaignListItemDTO[]; total: number }> {
    const where: Prisma.CampaignWhereInput = {};

    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: "insensitive" } },
        { description: { contains: query.keyword, mode: "insensitive" } },
      ];
    }
    if (query.country) where.country = query.country;
    if (query.state) where.state = query.state;
    if (query.city) where.city = query.city;
    if (query.locationType) where.locationType = query.locationType;
    if (query.compensationType) where.compensationType = query.compensationType;
    if (query.status) where.status = query.status;

    if (query.contentNiche) {
      where.contentNiches = {
        some: { contentNiche: { name: query.contentNiche } },
      };
    }
    if (query.contentFormat) {
      where.contentFormats = {
        some: { contentFormat: { name: query.contentFormat } },
      };
    }

    const orderBy = SORT_MAP[query.sort] ?? SORT_MAP.newest;
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: listInclude,
        orderBy,
        skip,
        take: query.limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return { items: items.map(toListDTO), total };
  },

  /**
   * Find a single campaign by ID with all details.
   */
  async findById(id: string): Promise<CampaignDetailDTO | null> {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: detailInclude,
    });

    return campaign ? toDetailDTO(campaign) : null;
  },

  /**
   * Return the owning businessId for a campaign, used for authorization.
   */
  async findOwner(id: string): Promise<string | null> {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { businessId: true },
    });
    return campaign?.businessId ?? null;
  },

  /**
   * Create a campaign with images, niches, and formats in a single transaction.
   */
  async create(data: {
    businessId: string;
    title: string;
    description: string;
    productName?: string;
    compensationType: CompensationType;
    budget?: number;
    currency?: string;
    creatorSlots?: number;
    applicationDeadline?: Date;
    contentDeadline?: Date;
    locationType?: LocationType;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    status?: CampaignStatus;
    images?: string[];
    nicheIds: string[];
    formatEntries: { contentFormatId: string; quantity: number }[];
  }): Promise<CampaignDetailDTO> {
    const {
      images,
      nicheIds,
      formatEntries,
      ...campaignData
    } = data;

    const campaign = await prisma.campaign.create({
      data: {
        ...campaignData,
        images: images?.length
          ? { create: images.map((url, i) => ({ imageUrl: url, sortOrder: i })) }
          : undefined,
        contentNiches: nicheIds.length
          ? { create: nicheIds.map((id) => ({ contentNicheId: id })) }
          : undefined,
        contentFormats: formatEntries.length
          ? {
              create: formatEntries.map((e) => ({
                contentFormatId: e.contentFormatId,
                quantity: e.quantity,
              })),
            }
          : undefined,
      },
      include: detailInclude,
    });

    return toDetailDTO(campaign);
  },

  /**
   * Update campaign fields and optionally replace images/niches/formats.
   */
  async update(
    id: string,
    data: {
      fields: Prisma.CampaignUpdateInput;
      images?: string[];
      nicheIds?: string[];
      formatEntries?: { contentFormatId: string; quantity: number }[];
    }
  ): Promise<CampaignDetailDTO> {
    return prisma.$transaction(async (tx) => {
      // Replace images if supplied
      if (data.images !== undefined) {
        await tx.campaignImage.deleteMany({ where: { campaignId: id } });
        if (data.images.length > 0) {
          await tx.campaignImage.createMany({
            data: data.images.map((url, i) => ({
              campaignId: id,
              imageUrl: url,
              sortOrder: i,
            })),
          });
        }
      }

      // Replace niches if supplied
      if (data.nicheIds !== undefined) {
        await tx.campaignContentNiche.deleteMany({
          where: { campaignId: id },
        });
        if (data.nicheIds.length > 0) {
          await tx.campaignContentNiche.createMany({
            data: data.nicheIds.map((nicheId) => ({
              campaignId: id,
              contentNicheId: nicheId,
            })),
          });
        }
      }

      // Replace formats if supplied
      if (data.formatEntries !== undefined) {
        await tx.campaignContentFormat.deleteMany({
          where: { campaignId: id },
        });
        if (data.formatEntries.length > 0) {
          await tx.campaignContentFormat.createMany({
            data: data.formatEntries.map((e) => ({
              campaignId: id,
              contentFormatId: e.contentFormatId,
              quantity: e.quantity,
            })),
          });
        }
      }

      // Update campaign fields
      const campaign = await tx.campaign.update({
        where: { id },
        data: data.fields,
        include: detailInclude,
      });

      return toDetailDTO(campaign);
    });
  },

  /**
   * Delete a campaign. Child records cascade via schema.
   */
  async delete(id: string): Promise<void> {
    await prisma.campaign.delete({ where: { id } });
  },
};

// ─────────────────────────────────────────────
// Content master table helpers
// ─────────────────────────────────────────────

export const contentRepository = {
  /** Find or create content niches by name. Returns their IDs. */
  async resolveNicheIds(names: string[]): Promise<string[]> {
    const ids: string[] = [];
    for (const name of names) {
      const niche = await prisma.contentNiche.upsert({
        where: { name },
        update: {},
        create: { name },
        select: { id: true },
      });
      ids.push(niche.id);
    }
    return ids;
  },

  /** Find or create content formats by name. Returns their IDs. */
  async resolveFormatIds(
    names: string[]
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    for (const name of names) {
      const format = await prisma.contentFormat.upsert({
        where: { name },
        update: {},
        create: { name },
        select: { id: true },
      });
      map.set(name, format.id);
    }
    return map;
  },
};
