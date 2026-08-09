import { prisma } from "@/src/lib/prisma";
import type { BusinessProfileDTO } from "@/src/types/business";
import type {
  CreateBusinessProfileInput,
  UpdateBusinessProfileInput,
} from "@/src/validations/business.validation";

const profileSelect = {
  id: true,
  userId: true,
  companyName: true,
  companyLogo: true,
  website: true,
  companyDescription: true,
  country: true,
  state: true,
  city: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const businessRepository = {
  async findByUserId(userId: string): Promise<BusinessProfileDTO | null> {
    return prisma.businessProfile.findUnique({
      where: { userId },
      select: profileSelect,
    });
  },

  async create(
    userId: string,
    data: CreateBusinessProfileInput
  ): Promise<BusinessProfileDTO> {
    return prisma.businessProfile.create({
      data: { ...data, userId },
      select: profileSelect,
    });
  },

  async updateByUserId(
    userId: string,
    data: UpdateBusinessProfileInput
  ): Promise<BusinessProfileDTO> {
    return prisma.businessProfile.update({
      where: { userId },
      data,
      select: profileSelect,
    });
  },
};
