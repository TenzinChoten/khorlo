import { campaignRepository } from "@/src/repositories/campaign.repository";
import { messageRepository } from "@/src/repositories/message.repository";
import { subscriptionRepository } from "@/src/repositories/subscription.repository";
import { isPaidPlan } from "@/src/lib/plan-change";
import { startOfUtcMonth } from "@/src/lib/subscription-period";
import { ForbiddenError } from "@/src/types";
import type { PlanUsageDTO, SubscriptionDTO } from "@/src/types/subscription";

async function requireActiveSubscription(businessId: string): Promise<SubscriptionDTO> {
  await subscriptionRepository.expireStaleByBusinessId(businessId);
  const subscription = await subscriptionRepository.findOpenByBusinessId(businessId);

  if (!subscription || subscription.status !== "ACTIVE") {
    throw new ForbiddenError(
      "You need an active plan to use this feature. Start Free or upgrade to continue."
    );
  }

  // [Reason] Free has no end date; only paid cycles with a stored period can expire
  if (subscription.expiresAt && subscription.expiresAt.getTime() <= Date.now()) {
    throw new ForbiddenError(
      isPaidPlan(subscription.plan)
        ? "Your plan has expired. Renew to continue."
        : "You need an active plan to continue."
    );
  }

  return subscription;
}

export async function getPlanUsage(
  businessId: string,
  userId: string
): Promise<PlanUsageDTO> {
  await subscriptionRepository.expireStaleByBusinessId(businessId);
  const subscription = await subscriptionRepository.findOpenByBusinessId(businessId);
  const [activeCampaigns, messagesThisMonth] = await Promise.all([
    campaignRepository.countActiveByBusinessId(businessId),
    messageRepository.countSentByUserSince(userId, startOfUtcMonth()),
  ]);

  return {
    activeCampaigns,
    campaignLimit: subscription?.plan.campaignLimit ?? 0,
    messagesThisMonth,
    messageLimit: subscription?.plan.messageLimit ?? 0,
  };
}

export async function assertCanPostCampaign(
  businessId: string,
  excludeCampaignId?: string
): Promise<SubscriptionDTO> {
  const subscription = await requireActiveSubscription(businessId);

  const activeCampaigns = await campaignRepository.countActiveByBusinessId(
    businessId,
    excludeCampaignId
  );
  if (activeCampaigns >= subscription.plan.campaignLimit) {
    throw new ForbiddenError(
      `Your ${subscription.plan.name} plan allows ${subscription.plan.campaignLimit} active campaign${
        subscription.plan.campaignLimit === 1 ? "" : "s"
      }. Upgrade to post more.`
    );
  }

  return subscription;
}

export async function assertCanSendMessage(
  businessId: string,
  userId: string
): Promise<SubscriptionDTO> {
  const subscription = await requireActiveSubscription(businessId);

  const sent = await messageRepository.countSentByUserSince(userId, startOfUtcMonth());
  if (sent >= subscription.plan.messageLimit) {
    throw new ForbiddenError(
      `Your ${subscription.plan.name} plan allows ${subscription.plan.messageLimit} message${
        subscription.plan.messageLimit === 1 ? "" : "s"
      } per month. Upgrade to send more.`
    );
  }

  return subscription;
}
