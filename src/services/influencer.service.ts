import { requireRole } from "@/src/lib/require-role";
import { influencerRepository } from "@/src/repositories/influencer.repository";
import { contentRepository } from "@/src/repositories/campaign.repository";
import {
  createInfluencerProfileSchema,
  updateInfluencerProfileSchema,
} from "@/src/validations/influencer.validation";
import type {
  InfluencerProfileResponse,
  InfluencerPublicProfileResponse,
} from "@/src/types/influencer";
import {
  ValidationError,
  ConflictError,
  NotFoundError,
} from "@/src/types";

function parseValidation<T>(
  schema: {
    safeParse: (data: unknown) =>
      | { success: true; data: T }
      | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } };
  },
  body: unknown,
  message: string
): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(
      message,
      result.error.flatten().fieldErrors as Record<string, string[]>
    );
  }
  return result.data;
}

async function resolveContentIds(data: {
  contentNiches?: string[];
  contentFormats?: string[];
}) {
  let nicheIds: string[] = [];
  let formatIds: string[] = [];

  if (data.contentNiches?.length) {
    nicheIds = await contentRepository.resolveNicheIds(data.contentNiches);
  }

  if (data.contentFormats?.length) {
    const formatMap = await contentRepository.resolveFormatIds(data.contentFormats);
    formatIds = Array.from(formatMap.values());
  }

  return { nicheIds, formatIds };
}

export const influencerService = {
  async createProfile(body: unknown): Promise<InfluencerProfileResponse> {
    const user = await requireRole("INFLUENCER");

    const existing = await influencerRepository.findByUserId(user.id);
    if (existing) {
      throw new ConflictError("Influencer profile already exists");
    }

    const data = parseValidation(
      createInfluencerProfileSchema,
      body,
      "Invalid profile data"
    );

    const {
      socialAccounts,
      contentNiches,
      contentFormats,
      portfolio,
      ...profileFields
    } = data;

    const { nicheIds, formatIds } = await resolveContentIds({
      contentNiches,
      contentFormats,
    });

    const profile = await influencerRepository.create(
      user.id,
      profileFields,
      {
        socialAccounts,
        nicheIds,
        formatIds,
        portfolio,
      }
    );

    return { profile };
  },

  async getMyProfile(): Promise<InfluencerProfileResponse> {
    const user = await requireRole("INFLUENCER");

    const profile = await influencerRepository.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundError("Influencer profile not found");
    }

    return { profile };
  },

  async updateMyProfile(body: unknown): Promise<InfluencerProfileResponse> {
    const user = await requireRole("INFLUENCER");

    const existing = await influencerRepository.findByUserId(user.id);
    if (!existing) {
      throw new NotFoundError("Influencer profile not found");
    }

    const data = parseValidation(
      updateInfluencerProfileSchema,
      body,
      "Invalid profile data"
    );

    const {
      socialAccounts,
      contentNiches,
      contentFormats,
      portfolio,
      ...fields
    } = data;

    // Resolve content IDs only when supplied
    let nicheIds: string[] | undefined;
    let formatIds: string[] | undefined;

    if (contentNiches !== undefined) {
      nicheIds = contentNiches.length
        ? await contentRepository.resolveNicheIds(contentNiches)
        : [];
    }

    if (contentFormats !== undefined) {
      if (contentFormats.length) {
        const formatMap = await contentRepository.resolveFormatIds(contentFormats);
        formatIds = Array.from(formatMap.values());
      } else {
        formatIds = [];
      }
    }

    const profile = await influencerRepository.update(
      user.id,
      existing.id,
      {
        fields,
        socialAccounts,
        nicheIds,
        formatIds,
        portfolio,
      }
    );

    return { profile };
  },

  async getPublicProfile(id: string): Promise<InfluencerPublicProfileResponse> {
    const profile = await influencerRepository.findByIdPublic(id);
    if (!profile) {
      throw new NotFoundError("Influencer profile not found");
    }

    return { profile };
  },
};
