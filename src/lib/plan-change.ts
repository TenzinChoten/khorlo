import { cancelRazorpaySubscription } from "@/src/lib/razorpay";
import { subscriptionRepository } from "@/src/repositories/subscription.repository";
import { ConflictError } from "@/src/types";
import type { PlanDTO, SubscriptionDTO } from "@/src/types/subscription";

export function isPaidPlan(plan: Pick<PlanDTO, "price">): boolean {
  return plan.price > 0;
}

export function isMoreExpensivePlan(
  next: Pick<PlanDTO, "price">,
  current: Pick<PlanDTO, "price">
): boolean {
  return next.price > current.price;
}

export type PlanChangeAction = "reuse" | "create" | "upgrade";

export function assertCanChangePlan(
  existing: { planId: string; plan: Pick<PlanDTO, "price"> } | null,
  next: Pick<PlanDTO, "id" | "price">
): PlanChangeAction {
  if (!existing) {
    return "create";
  }
  if (existing.planId === next.id) {
    return "reuse";
  }
  // [Reason] Brands may only move to a higher-priced plan; cheaper plans stay locked
  if (!isMoreExpensivePlan(next, existing.plan)) {
    throw new ConflictError(
      "You cannot switch to a cheaper plan. Choose a higher plan or keep your current one."
    );
  }
  return "upgrade";
}

export async function closeOpenSubscription(
  existing: SubscriptionDTO
): Promise<void> {
  if (existing.razorpaySubscriptionId) {
    try {
      await cancelRazorpaySubscription(existing.razorpaySubscriptionId, false);
    } catch {
      // [Reason] Local close must still free the single open-subscription slot
    }
  }
  if (existing.status !== "CANCELLED" && existing.status !== "EXPIRED") {
    await subscriptionRepository.update(existing.id, { status: "CANCELLED" });
  }
}
