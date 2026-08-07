import { requireRole } from "@/src/lib/require-role";
import {
  campaignRepository,
  contentRepository,
} from "@/src/repositories/campaign.repository";
import { businessRepository } from "@/src/repositories/business.repository";
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignQuerySchema,
} from "@/src/validations/campaign.validation";
import type {
  CampaignDetailResponse,
  CampaignListResponse,
} from "@/src/types/campaign";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "@/src/types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function parseValidation<T>(
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } },
  body: unknown,
  message: string
): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(message, result.error.flatten().fieldErrors as Record<string, string[]>);
  }
  return result.data;
}

/**
 * Resolves content niche names → IDs and content format names → { id, quantity } entries.
 */
async function resolveContentRelations(data: {
  contentNiches?: string[];
  contentFormats?: { format: string; quantity: number }[];
}) {
  let nicheIds: string[] = [];
  let formatEntries: { contentFormatId: string; quantity: number }[] = [];

  if (data.contentNiches?.length) {
    nicheIds = await contentRepository.resolveNicheIds(data.contentNiches);
  }

  if (data.contentFormats?.length) {
    const formatMap = await contentRepository.resolveFormatIds(
      data.contentFormats.map((f) => f.format)
    );
    formatEntries = data.contentFormats.map((f) => ({
      contentFormatId: formatMap.get(f.format)!,
      quantity: f.quantity,
    }));
  }

  return { nicheIds, formatEntries };
}

/**
 * Verifies the authenticated business user owns the campaign.
 * Returns the business profile ID.
 */
async function verifyOwnership(campaignId: string, userId: string): Promise<string> {
  const businessProfile = await businessRepository.findByUserId(userId);
  if (!businessProfile) {
    throw new NotFoundError("Business profile not found");
  }

  const ownerBusinessId = await campaignRepository.findOwner(campaignId);
  if (!ownerBusinessId) {
    throw new NotFoundError("Campaign not found");
  }

  if (ownerBusinessId !== businessProfile.id) {
    throw new ForbiddenError("You do not own this campaign");
  }

  return businessProfile.id;
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const campaignService = {
  async create(body: unknown): Promise<CampaignDetailResponse> {
    const user = await requireRole("BUSINESS");
    const data = parseValidation(createCampaignSchema, body, "Invalid campaign data");

    const businessProfile = await businessRepository.findByUserId(user.id);
    if (!businessProfile) {
      throw new NotFoundError(
        "You must create a business profile before creating campaigns"
      );
    }

    const { nicheIds, formatEntries } = await resolveContentRelations(data);

    const {
      images,
      contentNiches: _niches,
      contentFormats: _formats,
      ...campaignFields
    } = data;

    const campaign = await campaignRepository.create({
      businessId: businessProfile.id,
      ...campaignFields,
      images,
      nicheIds,
      formatEntries,
    });

    return { campaign };
  },

  async list(searchParams: URLSearchParams): Promise<CampaignListResponse> {
    const params = Object.fromEntries(searchParams.entries());
    const query = parseValidation(campaignQuerySchema, params, "Invalid query parameters");

    const { items, total } = await campaignRepository.findMany(query);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  },

  async getById(id: string): Promise<CampaignDetailResponse> {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    return { campaign };
  },

  async update(
    id: string,
    body: unknown
  ): Promise<CampaignDetailResponse> {
    const user = await requireRole("BUSINESS");
    await verifyOwnership(id, user.id);

    const data = parseValidation(updateCampaignSchema, body, "Invalid campaign data");

    const { images, contentNiches, contentFormats, ...fields } = data;

    // Resolve content relations only if supplied
    let nicheIds: string[] | undefined;
    let formatEntries: { contentFormatId: string; quantity: number }[] | undefined;

    if (contentNiches !== undefined) {
      nicheIds = contentNiches.length
        ? await contentRepository.resolveNicheIds(contentNiches)
        : [];
    }

    if (contentFormats !== undefined) {
      if (contentFormats.length) {
        const formatMap = await contentRepository.resolveFormatIds(
          contentFormats.map((f) => f.format)
        );
        formatEntries = contentFormats.map((f) => ({
          contentFormatId: formatMap.get(f.format)!,
          quantity: f.quantity,
        }));
      } else {
        formatEntries = [];
      }
    }

    const campaign = await campaignRepository.update(id, {
      fields,
      images,
      nicheIds,
      formatEntries,
    });

    return { campaign };
  },

  async delete(id: string): Promise<void> {
    const user = await requireRole("BUSINESS");
    await verifyOwnership(id, user.id);

    await campaignRepository.delete(id);
  },
};
