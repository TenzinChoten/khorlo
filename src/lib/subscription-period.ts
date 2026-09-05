import type { BillingCycle } from "@/app/generated/prisma/enums";
import type { PlanDTO } from "@/src/types/subscription";

export function addBillingCycle(from: Date, billingCycle: BillingCycle): Date {
  const next = new Date(from);
  if (billingCycle === "YEARLY") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

export function periodEndFromPlan(plan: PlanDTO, from = new Date()): Date {
  return addBillingCycle(from, plan.billingCycle);
}

export function expiresAtForPlan(
  plan: Pick<PlanDTO, "price" | "billingCycle">,
  from = new Date()
): Date | null {
  // [Reason] Free has no billing period, so there is nothing to renew or end
  if (plan.price <= 0) {
    return null;
  }
  return addBillingCycle(from, plan.billingCycle);
}

export function startOfUtcMonth(from = new Date()): Date {
  // [Reason] Plan message caps reset on the calendar month, not the subscription start
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
}
