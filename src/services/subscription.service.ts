import { requireRole } from "@/src/lib/require-role";
import { businessRepository } from "@/src/repositories/business.repository";
import { planRepository } from "@/src/repositories/plan.repository";
import { subscriptionRepository } from "@/src/repositories/subscription.repository";
import { notificationService } from "@/src/services/notification.service";
import {
  cancelRazorpaySubscription,
  createRazorpayPlan,
  createRazorpaySubscription,
  getRazorpayKeyId,
  unixSecondsToDate,
} from "@/src/lib/razorpay";
import {
  cancelSubscriptionSchema,
  createSubscriptionSchema,
} from "@/src/validations/subscription.validation";
import type {
  CreateSubscriptionResponse,
  PlanDTO,
  SubscriptionDTO,
  SubscriptionListResponse,
  SubscriptionResponse,
} from "@/src/types/subscription";
import {
  NotFoundError,
  ValidationError,
} from "@/src/types";
import { expiresAtForPlan } from "@/src/lib/subscription-period";
import {
  assertCanChangePlan,
  closeOpenSubscription,
  isPaidPlan,
} from "@/src/lib/plan-change";
import { getPlanUsage } from "@/src/services/campaign-entitlement.service";
import type { BillingCycle } from "@/app/generated/prisma/enums";

function parseValidation<T>(
  schema: {
    safeParse: (
      data: unknown
    ) =>
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

function totalCountForCycle(billingCycle: BillingCycle): number {
  return billingCycle === "YEARLY" ? 10 : 120;
}

function toPaise(price: number): number {
  return Math.round(price * 100);
}

async function requireBusinessProfile(userId: string) {
  const profile = await businessRepository.findByUserId(userId);
  if (!profile) {
    throw new NotFoundError("Business profile not found");
  }
  return profile;
}

export async function ensureDefaultFreeSubscription(
  businessId: string
): Promise<SubscriptionDTO> {
  await subscriptionRepository.expireStaleByBusinessId(businessId);
  const open = await subscriptionRepository.findOpenByBusinessId(businessId);
  if (open && isPaidPlan(open.plan)) {
    return open;
  }
  if (open && !isPaidPlan(open.plan)) {
    // [Reason] Older Free rows may still have a leftover end date — clear it
    if (open.expiresAt) {
      return subscriptionRepository.update(open.id, { expiresAt: null });
    }
    return open;
  }

  const freePlan = await planRepository.findDefaultFree();
  if (!freePlan) {
    throw new NotFoundError("Free plan is not configured");
  }

  const startsAt = new Date();
  try {
    return await subscriptionRepository.create({
      businessId,
      planId: freePlan.id,
      razorpaySubscriptionId: null,
      startsAt,
      expiresAt: null,
      status: "ACTIVE",
    });
  } catch (error) {
    // [Reason] Concurrent first visits can both try to insert Free; reuse the winner
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      const existing = await subscriptionRepository.findOpenByBusinessId(businessId);
      if (existing) {
        return existing;
      }
    }
    throw error;
  }
}

async function ensureRazorpayPlan(plan: PlanDTO): Promise<string> {
  if (plan.razorpayPlanId) {
    return plan.razorpayPlanId;
  }

  const created = await createRazorpayPlan({
    name: plan.name,
    amountPaise: toPaise(plan.price),
    period: plan.billingCycle === "YEARLY" ? "yearly" : "monthly",
  });

  const updated = await planRepository.setRazorpayPlanId(plan.id, created.id);
  return updated.razorpayPlanId as string;
}

export const subscriptionService = {
  async listMine(): Promise<SubscriptionListResponse> {
    const user = await requireRole("BUSINESS");
    const profile = await requireBusinessProfile(user.id);
    await ensureDefaultFreeSubscription(profile.id);
    const subscriptions = await subscriptionRepository.listByBusinessId(profile.id);
    return { subscriptions };
  },

  async getMine(): Promise<SubscriptionResponse> {
    const user = await requireRole("BUSINESS");
    const profile = await requireBusinessProfile(user.id);
    const subscription = await ensureDefaultFreeSubscription(profile.id);
    const usage = await getPlanUsage(profile.id, user.id);
    return { subscription, usage };
  },

  async create(body: unknown): Promise<CreateSubscriptionResponse> {
    const user = await requireRole("BUSINESS");
    const input = parseValidation(
      createSubscriptionSchema,
      body,
      "Invalid subscription data"
    );
    const profile = await requireBusinessProfile(user.id);

    const plan = await planRepository.findById(input.planId);
    if (!plan || !plan.isActive) {
      throw new NotFoundError("Plan not found");
    }

    const existing = await subscriptionRepository.findOpenByBusinessId(profile.id);
    const change = assertCanChangePlan(existing, plan);
    if (change === "reuse" && existing) {
      return {
        subscription: existing,
        checkout:
          existing.razorpaySubscriptionId && isPaidPlan(plan)
            ? {
                keyId: getRazorpayKeyId(),
                razorpaySubscriptionId: existing.razorpaySubscriptionId,
              }
            : null,
      };
    }
    // [Reason] Upgrades replace the current seat so the new plan becomes the only open row
    if (existing && change === "upgrade") {
      await closeOpenSubscription(existing);
    }

    const startsAt = new Date();
    const expiresAt = expiresAtForPlan(plan, startsAt);

    // [Reason] Free plans never touch Razorpay so we do not create empty payment objects
    if (plan.price <= 0) {
      const subscription = await subscriptionRepository.create({
        businessId: profile.id,
        planId: plan.id,
        razorpaySubscriptionId: null,
        startsAt,
        expiresAt,
        status: "ACTIVE",
      });

      await notificationService.createNotification(
        user.id,
        "Subscription activated",
        `Your ${plan.name} plan is now active.`,
        "SUBSCRIPTION"
      );

      return { subscription, checkout: null };
    }

    if (toPaise(plan.price) < 100) {
      throw new ValidationError("Invalid plan price", {
        planId: ["Paid plans must be at least 1.00 in the configured Razorpay currency"],
      });
    }

    const razorpayPlanId = await ensureRazorpayPlan(plan);
    const razorpaySubscription = await createRazorpaySubscription({
      planId: razorpayPlanId,
      totalCount: totalCountForCycle(plan.billingCycle),
      notes: {
        businessId: profile.id,
        planId: plan.id,
        userId: user.id,
      },
    });

    const subscription = await subscriptionRepository.create({
      businessId: profile.id,
      planId: plan.id,
      razorpaySubscriptionId: razorpaySubscription.id,
      startsAt: unixSecondsToDate(razorpaySubscription.start_at) ?? startsAt,
      expiresAt:
        unixSecondsToDate(razorpaySubscription.current_end) ??
        unixSecondsToDate(razorpaySubscription.end_at) ??
        expiresAt,
      status: "PENDING",
    });

    return {
      subscription,
      checkout: {
        keyId: getRazorpayKeyId(),
        razorpaySubscriptionId: razorpaySubscription.id,
      },
    };
  },

  async cancel(body: unknown): Promise<SubscriptionResponse> {
    const user = await requireRole("BUSINESS");
    const input = parseValidation(
      cancelSubscriptionSchema,
      body ?? {},
      "Invalid cancellation data"
    );
    const profile = await requireBusinessProfile(user.id);

    const subscription = input.subscriptionId
      ? await subscriptionRepository.findById(input.subscriptionId)
      : await subscriptionRepository.findOpenByBusinessId(profile.id);

    if (!subscription || subscription.businessId !== profile.id) {
      throw new NotFoundError("Subscription not found");
    }

    if (subscription.status === "CANCELLED" || subscription.status === "EXPIRED") {
      return { subscription };
    }

    const cancelAtCycleEnd = Boolean(input.cancelAtCycleEnd);

    if (subscription.razorpaySubscriptionId) {
      await cancelRazorpaySubscription(
        subscription.razorpaySubscriptionId,
        cancelAtCycleEnd
      );
    }

    // [Reason] Cycle-end cancels stay ACTIVE until Razorpay confirms the period is over
    if (cancelAtCycleEnd && subscription.status === "ACTIVE") {
      return { subscription };
    }

    const updated = await subscriptionRepository.update(subscription.id, {
      status: "CANCELLED",
    });

    await notificationService.createNotification(
      user.id,
      "Subscription cancelled",
      `Your ${subscription.plan.name} subscription has been cancelled.`,
      "SUBSCRIPTION"
    );

    const fallback = await ensureDefaultFreeSubscription(profile.id);
    return { subscription: fallback.status === "ACTIVE" ? fallback : updated };
  },
};

