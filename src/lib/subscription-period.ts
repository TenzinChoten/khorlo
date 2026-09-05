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
