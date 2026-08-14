import { z } from "zod";

export const createOrderSchema = z.object({
  amount: z.coerce.number().int().optional(),
  currency: z.string().trim().min(3).max(10).optional(),
  receipt: z.string().trim().min(1).max(40).optional(),
  planId: z.string().trim().min(1).max(64).optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order id is required").max(64).trim(),
  razorpay_payment_id: z.string().min(1, "Payment id is required").max(64).trim(),
  razorpay_signature: z.string().min(1, "Signature is required").max(256).trim(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
