import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planId: z.string().min(1, "Plan is required").max(64).trim(),
});

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1).max(64).trim().optional(),
  cancelAtCycleEnd: z.boolean().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
