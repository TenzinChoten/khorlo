import { randomBytes } from "crypto";
import { getCurrentUser } from "@/src/lib/auth";
import { businessRepository } from "@/src/repositories/business.repository";
import { planRepository } from "@/src/repositories/plan.repository";
import { subscriptionRepository } from "@/src/repositories/subscription.repository";
import { notificationService } from "@/src/services/notification.service";
import {
  createRazorpayOrder,
  fetchRazorpayOrder,
  getRazorpayCurrency,
  getRazorpayKeyId,
  verifyCheckoutPaymentSignature,
} from "@/src/lib/razorpay";
import { expiresAtForPlan } from "@/src/lib/subscription-period";
import {
  assertCanChangePlan,
  closeOpenSubscription,
  isMoreExpensivePlan,
} from "@/src/lib/plan-change";
import {
  createOrderSchema,
  verifyPaymentSchema,
} from "@/src/validations/payment.validation";
import { ValidationError } from "@/src/types";
import type { SubscriptionDTO } from "@/src/types/subscription";

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

async function activatePlanFromCheckoutOrder(
  orderId: string
): Promise<SubscriptionDTO | null> {
  const order = await fetchRazorpayOrder(orderId);
  const planId = order.notes?.planId?.trim();
  const userId = order.notes?.userId?.trim();
  if (!planId || !userId) {
    return null;
  }

  const plan = await planRepository.findById(planId);
  if (!plan || !plan.isActive || plan.price <= 0) {
    return null;
  }

  const profile = await businessRepository.findByUserId(userId);
  if (!profile) {
    return null;
  }

  const existing = await subscriptionRepository.findOpenByBusinessId(profile.id);
  if (existing?.planId === plan.id && existing.status === "ACTIVE") {
    return existing;
  }

  if (existing) {
    if (existing.planId === plan.id) {
      // [Reason] Same-plan PENDING checkout should activate the existing row, not insert a second seat
      const startsAt = new Date();
      return subscriptionRepository.update(existing.id, {
        status: "ACTIVE",
        startsAt,
        expiresAt: expiresAtForPlan(plan, startsAt),
      });
    }
    // [Reason] After a charge, never replace the current seat with a cheaper plan
    if (!isMoreExpensivePlan(plan, existing.plan)) {
      return existing;
    }
    // [Reason] Paid upgrade: close the cheaper seat so the new plan can take the open slot
    await closeOpenSubscription(existing);
  }

  const startsAt = new Date();
  const subscription = await subscriptionRepository.create({
    businessId: profile.id,
    planId: plan.id,
    razorpaySubscriptionId: null,
    startsAt,
    expiresAt: expiresAtForPlan(plan, startsAt),
    status: "ACTIVE",
  });

  await notificationService.createNotification(
    userId,
    "Subscription activated",
    `Your ${plan.name} plan is now active.`,
    "SUBSCRIPTION"
  );

  return subscription;
}

export const paymentService = {
  async createOrder(body: unknown) {
    // [Reason] Only signed-in users can create payable orders
    const user = await getCurrentUser();
    const input = parseValidation(createOrderSchema, body, "Invalid order data");

    let amountPaise = input.amount;
    let currency = (input.currency || getRazorpayCurrency()).toUpperCase();
    const notes: Record<string, string> = { userId: user.id };

    if (input.planId) {
      const plan = await planRepository.findById(input.planId);
      if (!plan || !plan.isActive) {
        throw new ValidationError("Invalid plan", { planId: ["Plan not found"] });
      }
      const profile = await businessRepository.findByUserId(user.id);
      if (!profile) {
        throw new ValidationError("Business profile is required", {
          planId: ["Create a brand profile before buying a plan"],
        });
      }
      const existing = await subscriptionRepository.findOpenByBusinessId(profile.id);
      if (existing?.planId === plan.id && existing.status === "ACTIVE") {
        throw new ValidationError("This plan is already active", {
          planId: ["Choose a more expensive plan to upgrade"],
        });
      }
      // [Reason] Reject cheaper checkouts before Razorpay collects payment
      assertCanChangePlan(existing, plan);
      // [Reason] Charge the stored plan price so the client cannot underpay
      amountPaise = Math.round(plan.price * 100);
      notes.planId = plan.id;
    }

    if (amountPaise == null || !Number.isFinite(amountPaise)) {
      throw new ValidationError("Invalid amount", {
        amount: ["Amount in paise is required"],
      });
    }

    if (amountPaise < 100) {
      throw new ValidationError("Invalid amount", {
        amount: ["Minimum amount is 100 paise"],
      });
    }

    const receipt = input.receipt || `rcpt_${randomBytes(8).toString("hex")}`;
    const order = await createRazorpayOrder({
      amountPaise,
      currency,
      receipt,
      notes,
    });

    return {
      order_id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      // [Reason] Checkout only needs the public key id
      key_id: getRazorpayKeyId(),
    };
  },

  async verifyPayment(body: unknown) {
    const input = parseValidation(
      verifyPaymentSchema,
      body,
      "Missing payment verification fields"
    );

    const valid = verifyCheckoutPaymentSignature({
      orderId: input.razorpay_order_id,
      paymentId: input.razorpay_payment_id,
      signature: input.razorpay_signature,
    });

    if (!valid) {
      // [Reason] Never mark a payment paid when the checkout HMAC does not match
      throw new ValidationError("Payment verification failed", {
        razorpay_signature: ["Signature mismatch"],
      });
    }

    // [Reason] Plan checkout orders carry planId in Razorpay notes; activate after HMAC passes
    const subscription = await activatePlanFromCheckoutOrder(input.razorpay_order_id);

    return {
      success: true,
      order_id: input.razorpay_order_id,
      payment_id: input.razorpay_payment_id,
      subscription: subscription
        ? { id: subscription.id, planId: subscription.planId, status: subscription.status }
        : null,
    };
  },
};
