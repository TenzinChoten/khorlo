import crypto from "crypto";
import { prisma } from "@/src/lib/prisma";
import { subscriptionRepository } from "@/src/repositories/subscription.repository";
import { planRepository } from "@/src/repositories/plan.repository";
import { notificationService } from "@/src/services/notification.service";
import {
  unixSecondsToDate,
  verifyRazorpayWebhookSignature,
  type RazorpaySubscriptionEntity,
} from "@/src/lib/razorpay";
import { periodEndFromPlan } from "@/src/lib/subscription-period";
import { UnauthorizedError, ValidationError } from "@/src/types";
import type { SubscriptionStatus } from "@/app/generated/prisma/enums";
import type { SubscriptionDTO } from "@/src/types/subscription";

interface RazorpayWebhookPayload {
  id?: string;
  event?: string;
  payload?: {
    subscription?: { entity?: RazorpaySubscriptionEntity };
    payment?: {
      entity?: {
        id?: string;
        status?: string;
        subscription_id?: string;
        notes?: Record<string, string>;
      };
    };
  };
}

const HANDLED_EVENTS = new Set([
  "subscription.authenticated",
  "subscription.activated",
  "subscription.charged",
  "subscription.pending",
  "subscription.halted",
  "subscription.cancelled",
  "subscription.completed",
  "subscription.paused",
  "subscription.resumed",
  "payment.failed",
]);

function mapRazorpayStatus(
  event: string,
  razorpayStatus?: string
): SubscriptionStatus | null {
  if (event === "payment.failed") {
    return "FAILED";
  }

  const status = (razorpayStatus || "").toLowerCase();

  if (
    event === "subscription.activated" ||
    event === "subscription.charged" ||
    event === "subscription.resumed" ||
    status === "active"
  ) {
    return "ACTIVE";
  }

  if (event === "subscription.cancelled" || status === "cancelled") {
    return "CANCELLED";
  }

  if (event === "subscription.completed" || status === "completed" || status === "expired") {
    return "EXPIRED";
  }

  if (event === "subscription.halted" || status === "halted") {
    return "FAILED";
  }

  if (
    event === "subscription.authenticated" ||
    event === "subscription.pending" ||
    event === "subscription.paused" ||
    status === "authenticated" ||
    status === "created" ||
    status === "pending" ||
    status === "paused"
  ) {
    return "PENDING";
  }

  return null;
}

function webhookEventId(rawBody: string, headerEventId: string | null, parsed: RazorpayWebhookPayload): string {
  if (headerEventId?.trim()) {
    return headerEventId.trim();
  }
  if (parsed.id?.trim()) {
    return parsed.id.trim();
  }
  // [Reason] Older Razorpay payloads omit event ids; hash the body so retries stay idempotent
  return crypto.createHash("sha256").update(rawBody).digest("hex");
}

async function claimWebhookEvent(eventId: string, event: string): Promise<boolean> {
  try {
    await prisma.razorpayWebhookEvent.create({
      data: { eventId, event },
    });
    return true;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return false;
    }
    throw error;
  }
}

async function notifyStatusChange(
  subscription: SubscriptionDTO,
  status: SubscriptionStatus
): Promise<void> {
  const business = await prisma.businessProfile.findUnique({
    where: { id: subscription.businessId },
    select: { userId: true },
  });
  if (!business) {
    return;
  }

  const messages: Record<SubscriptionStatus, { title: string; body: string }> = {
    PENDING: {
      title: "Subscription pending",
      body: `Complete checkout to activate your ${subscription.plan.name} plan.`,
    },
    ACTIVE: {
      title: "Subscription activated",
      body: `Your ${subscription.plan.name} plan is now active.`,
    },
    FAILED: {
      title: "Subscription payment failed",
      body: `We could not collect payment for your ${subscription.plan.name} plan.`,
    },
    CANCELLED: {
      title: "Subscription cancelled",
      body: `Your ${subscription.plan.name} subscription has been cancelled.`,
    },
    EXPIRED: {
      title: "Subscription expired",
      body: `Your ${subscription.plan.name} subscription has ended.`,
    },
  };

  const message = messages[status];
  await notificationService.createNotification(
    business.userId,
    message.title,
    message.body,
    "SUBSCRIPTION"
  );
}

export const razorpayWebhookService = {
  async handle(rawBody: string, signature: string | null, eventIdHeader: string | null): Promise<{ received: true }> {
    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedError("Invalid Razorpay webhook signature");
    }

    let parsed: RazorpayWebhookPayload;
    try {
      parsed = JSON.parse(rawBody) as RazorpayWebhookPayload;
    } catch {
      throw new ValidationError("Invalid webhook payload", { body: ["Payload must be valid JSON"] });
    }

    const event = parsed.event?.trim();
    if (!event) {
      throw new ValidationError("Invalid webhook payload", { event: ["Event name is required"] });
    }

    if (!HANDLED_EVENTS.has(event)) {
      return { received: true };
    }

    const eventId = webhookEventId(rawBody, eventIdHeader, parsed);
    const claimed = await claimWebhookEvent(eventId, event);
    if (!claimed) {
      return { received: true };
    }

    try {
      await applySubscriptionEvent(event, parsed);
    } catch (error) {
      // [Reason] Drop the claim so Razorpay can retry after a processing failure
      await prisma.razorpayWebhookEvent.delete({ where: { eventId } }).catch(() => undefined);
      throw error;
    }

    return { received: true };
  },
};

async function applySubscriptionEvent(
  event: string,
  parsed: RazorpayWebhookPayload
): Promise<void> {
  const entity = parsed.payload?.subscription?.entity;
  const payment = parsed.payload?.payment?.entity;
  const paymentNotes = payment?.notes;
  const razorpaySubscriptionId = entity?.id ?? payment?.subscription_id;

  let subscription = razorpaySubscriptionId
    ? await subscriptionRepository.findByRazorpaySubscriptionId(razorpaySubscriptionId)
    : null;

  if (!subscription && paymentNotes?.businessId) {
    subscription = await subscriptionRepository.findOpenByBusinessId(paymentNotes.businessId);
  }

  if (!subscription && !entity) {
    return;
  }

  if (!subscription && entity) {
    const planId = entity.notes?.planId;
    const businessId = entity.notes?.businessId;
    if (!planId || !businessId) {
      return;
    }

    const plan = await planRepository.findById(planId);
    if (!plan) {
      return;
    }

    const startsAt = unixSecondsToDate(entity.current_start) ?? unixSecondsToDate(entity.start_at) ?? new Date();
    const expiresAt =
      unixSecondsToDate(entity.current_end) ??
      unixSecondsToDate(entity.end_at) ??
      periodEndFromPlan(plan, startsAt);

    const status = mapRazorpayStatus(event, entity.status) ?? "PENDING";
    subscription = await subscriptionRepository.create({
      businessId,
      planId,
      razorpaySubscriptionId: entity.id,
      startsAt,
      expiresAt,
      status,
    });
    await notifyStatusChange(subscription, status);
    return;
  }

  if (!subscription) {
    return;
  }

  const nextStatus = mapRazorpayStatus(event, entity?.status);
  if (!nextStatus) {
    return;
  }

  // [Reason] A failed first charge should not downgrade an already-active renewal cycle
  if (event === "payment.failed" && subscription.status === "ACTIVE") {
    return;
  }

  const startsAt =
    unixSecondsToDate(entity?.current_start) ??
    unixSecondsToDate(entity?.start_at) ??
    subscription.startsAt;
  const expiresAt =
    unixSecondsToDate(entity?.current_end) ??
    unixSecondsToDate(entity?.end_at) ??
    subscription.expiresAt;

  const unchanged =
    subscription.status === nextStatus &&
    subscription.startsAt.getTime() === startsAt.getTime() &&
    subscription.expiresAt.getTime() === expiresAt.getTime();

  if (unchanged) {
    return;
  }

  const updated = await subscriptionRepository.update(subscription.id, {
    status: nextStatus,
    startsAt,
    expiresAt,
    razorpaySubscriptionId: entity?.id ?? subscription.razorpaySubscriptionId,
  });

  if (updated.status !== subscription.status) {
    await notifyStatusChange(updated, updated.status);
  }

  if (["CANCELLED", "EXPIRED", "FAILED"].includes(updated.status)) {
    const { ensureDefaultFreeSubscription } = await import(
      "@/src/services/subscription.service"
    );
    await ensureDefaultFreeSubscription(updated.businessId);
  }
}
