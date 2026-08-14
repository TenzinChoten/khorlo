import { prisma } from "@/src/lib/prisma";
import type { PlanDTO } from "@/src/types/subscription";

const planSelect = {
  id: true,
  name: true,
  price: true,
  billingCycle: true,
  campaignLimit: true,
  messageLimit: true,
  advancedSearch: true,
  featuredCampaigns: true,
  razorpayPlanId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const planRepository = {
  async findActive(): Promise<PlanDTO[]> {
    return prisma.plan.findMany({
      where: { isActive: true },
      select: planSelect,
      orderBy: [{ price: "asc" }, { name: "asc" }],
    });
  },

  async findById(id: string): Promise<PlanDTO | null> {
    return prisma.plan.findUnique({
      where: { id },
      select: planSelect,
    });
  },

  async setRazorpayPlanId(id: string, razorpayPlanId: string): Promise<PlanDTO> {
    return prisma.plan.update({
      where: { id },
      data: { razorpayPlanId },
      select: planSelect,
    });
  },
};
