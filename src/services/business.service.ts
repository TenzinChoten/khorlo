import { requireRole } from "@/src/lib/require-role";
import { businessRepository } from "@/src/repositories/business.repository";
import {
  createBusinessProfileSchema,
  updateBusinessProfileSchema,
} from "@/src/validations/business.validation";
import type { BusinessProfileResponse } from "@/src/types/business";
import {
  ValidationError,
  ConflictError,
  NotFoundError,
} from "@/src/types";

export const businessService = {
  async createProfile(body: unknown): Promise<BusinessProfileResponse> {
    const user = await requireRole("BUSINESS");

    const existing = await businessRepository.findByUserId(user.id);
    if (existing) {
      throw new ConflictError("Business profile already exists");
    }

    const result = createBusinessProfileSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      throw new ValidationError("Invalid profile data", errors);
    }

    const profile = await businessRepository.create(user.id, result.data);
    // [Reason] New brands start on Free until they buy a paid plan
    const { ensureDefaultFreeSubscription } = await import(
      "@/src/services/subscription.service"
    );
    await ensureDefaultFreeSubscription(profile.id);

    return { profile };
  },

  async getMyProfile(): Promise<BusinessProfileResponse> {
    const user = await requireRole("BUSINESS");

    const profile = await businessRepository.findByUserId(user.id);
    if (!profile) {
      throw new NotFoundError("Business profile not found");
    }

    return { profile };
  },

  async updateMyProfile(body: unknown): Promise<BusinessProfileResponse> {
    const user = await requireRole("BUSINESS");

    const existing = await businessRepository.findByUserId(user.id);
    if (!existing) {
      throw new NotFoundError("Business profile not found");
    }

    const result = updateBusinessProfileSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      throw new ValidationError("Invalid profile data", errors);
    }

    const profile = await businessRepository.updateByUserId(
      user.id,
      result.data
    );

    return { profile };
  },
};
