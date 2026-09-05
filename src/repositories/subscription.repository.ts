import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { SubscriptionStatus } from "@/app/generated/prisma/client";
import type { PlanDTO, SubscriptionDTO } from "@/src/types/subscription";

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

const subscriptionInclude = {
  plan: { select: planSelect },
} as const;

type SubscriptionWithPlan = Prisma.SubscriptionGetPayload<{
  include: typeof subscriptionInclude;
}>;

function toDTO(subscription: SubscriptionWithPlan): SubscriptionDTO {
  return {
    id: subscription.id,
    businessId: subscription.businessId,
    planId: subscription.planId,
    razorpaySubscriptionId: subscription.razorpaySubscriptionId,
    startsAt: subscription.startsAt,
    expiresAt: subscription.expiresAt,
    status: subscription.status,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
    plan: subscription.plan as PlanDTO,
  };
}

const openStatuses: SubscriptionStatus[] = [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING];

export const subscriptionRepository = {
  async findById(id: string): Promise<SubscriptionDTO | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: subscriptionInclude,
    });
    return subscription ? toDTO(subscription) : null;
  },

  async findByRazorpaySubscriptionId(
    razorpaySubscriptionId: string
  ): Promise<SubscriptionDTO | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
      include: subscriptionInclude,
    });
    return subscription ? toDTO(subscription) : null;
  },

  async expireStaleByBusinessId(businessId: string): Promise<number> {
    // [Reason] ACTIVE rows past expiresAt must become EXPIRED so Free cannot keep posting
    const result = await prisma.subscription.updateMany({
      where: {
        businessId,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: { lte: new Date() },
      },
      data: { status: SubscriptionStatus.EXPIRED },
    });
    return result.count;
  },

  async findOpenByBusinessId(businessId: string): Promise<SubscriptionDTO | null> {
    const now = new Date();
    const subscription = await prisma.subscription.findFirst({
      where: {
        businessId,
        OR: [
          { status: SubscriptionStatus.PENDING },
          { status: SubscriptionStatus.ACTIVE, expiresAt: { gt: now } },
        ],
      },
      include: subscriptionInclude,
      orderBy: { createdAt: "desc" },
    });
    return subscription ? toDTO(subscription) : null;
  },

  async findLatestByBusinessId(businessId: string): Promise<SubscriptionDTO | null> {
    const subscription = await prisma.subscription.findFirst({
      where: { businessId },
      include: subscriptionInclude,
      orderBy: { createdAt: "desc" },
    });
    return subscription ? toDTO(subscription) : null;
  },

  async listByBusinessId(businessId: string): Promise<SubscriptionDTO[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { businessId },
      include: subscriptionInclude,
      orderBy: { createdAt: "desc" },
    });
    return subscriptions.map(toDTO);
  },

  async create(data: {
    businessId: string;
    planId: string;
    razorpaySubscriptionId?: string | null;
    startsAt: Date;
    expiresAt: Date;
    status: SubscriptionStatus;
  }): Promise<SubscriptionDTO> {
    const subscription = await prisma.subscription.create({
      data,
      include: subscriptionInclude,
    });
    return toDTO(subscription);
  },

  async update(
    id: string,
    data: {
      planId?: string;
      razorpaySubscriptionId?: string | null;
      startsAt?: Date;
      expiresAt?: Date;
      status?: SubscriptionStatus;
    }
  ): Promise<SubscriptionDTO> {
    const subscription = await prisma.subscription.update({
      where: { id },
      data,
      include: subscriptionInclude,
    });
    return toDTO(subscription);
  },
};
