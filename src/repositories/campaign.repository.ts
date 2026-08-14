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
  // [Reason] Slot availability is public campaign state, not private application data
  _count: {
    select: {
      applications: { where: { status: "ACCEPTED" as const } },
    },
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
    images: campaign.images,
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
    acceptedCount: campaign._count.applications,
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
  budget_asc: { budget: { sort: "asc", nulls: "last" } },
  // [Reason] Highest compensation should not rank unpaid/null budgets first
  budget_desc: { budget: { sort: "desc", nulls: "last" } },
  deadline: { applicationDeadline: { sort: "asc", nulls: "last" } },
};

const DEADLINE_WINDOW_DAYS: Record<string, number> = {
  soon: 3,
  "7": 7,
  "30": 30,
};

/**
 * Builds SQL-level discovery filters. Influencer listing is always OPEN and not expired.
 */
export function buildCampaignListWhere(
  query: CampaignQueryInput
): Prisma.CampaignWhereInput {
  const now = new Date();
  const and: Prisma.CampaignWhereInput[] = [
    { status: "OPEN" },
  ];

  const keyword = query.keyword ?? query.search;
  if (keyword) {
    and.push({
      OR: [
        { title: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
        { business: { companyName: { contains: keyword, mode: "insensitive" } } },
      ],
    });
  }

  if (query.country) and.push({ country: { equals: query.country, mode: "insensitive" } });
  if (query.state) and.push({ state: { equals: query.state, mode: "insensitive" } });
  if (query.city) and.push({ city: { equals: query.city, mode: "insensitive" } });
  if (query.locationType) and.push({ locationType: query.locationType });
  if (query.compensationType) and.push({ compensationType: query.compensationType });
  if (query.minBudget !== undefined) {
    and.push({ budget: { gte: query.minBudget } });
  }

  const niches = [
    ...(query.niches ?? []),
    ...(query.contentNiche ? [query.contentNiche] : []),
  ];
  if (niches.length > 0) {
    // [Reason] Multiple niches match ANY selected niche (OR)
    and.push({
      contentNiches: {
        some: {
          contentNiche: { name: { in: niches, mode: "insensitive" } },
        },
      },
    });
  }

  const formats = [
    ...(query.formats ?? []),
    ...(query.contentFormat ? [query.contentFormat] : []),
  ];
  if (formats.length > 0) {
    // [Reason] Multiple formats match ANY selected format (OR); combined with niches via AND
    and.push({
      contentFormats: {
        some: {
          contentFormat: { name: { in: formats, mode: "insensitive" } },
        },
      },
    });
  }

  const deadlineWindow = query.deadline && query.deadline !== "all"
    ? DEADLINE_WINDOW_DAYS[query.deadline]
    : undefined;

  if (deadlineWindow) {
    const until = new Date(now.getTime() + deadlineWindow * 24 * 60 * 60 * 1000);
    and.push({
      applicationDeadline: { gte: now, lte: until },
    });
  } else {
    // [Reason] Discovery must hide expired campaigns while still showing open-ended deadlines
    and.push({
      OR: [
        { applicationDeadline: null },
        { applicationDeadline: { gte: now } },
      ],
    });
  }

  return { AND: and };
}

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
    const where = buildCampaignListWhere(query);
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
