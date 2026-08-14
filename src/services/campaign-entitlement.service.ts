import { campaignRepository } from "@/src/repositories/campaign.repository";
import { subscriptionRepository } from "@/src/repositories/subscription.repository";
import { ForbiddenError } from "@/src/types";
import type { SubscriptionDTO } from "@/src/types/subscription";

function isPaidPlan(subscription: SubscriptionDTO): boolean {
  return subscription.plan.price > 0;
}

export async function assertCanPostCampaign(businessId: string): Promise<SubscriptionDTO> {
  await subscriptionRepository.expireStaleByBusinessId(businessId);
  const subscription = await subscriptionRepository.findOpenByBusinessId(businessId);

  if (!subscription || subscription.status !== "ACTIVE") {
    throw new ForbiddenError(
      "Your Free plan has expired. Upgrade or start a plan again to post a campaign."
    );
  }

  if (subscription.expiresAt.getTime() <= Date.now()) {
    throw new ForbiddenError(
      isPaidPlan(subscription)
        ? "Your plan has expired. Renew to post a campaign."
        : "Your Free plan has expired. Upgrade or start Free again to post a campaign."
    );
  }

  const activeCampaigns = await campaignRepository.countActiveByBusinessId(businessId);
  if (activeCampaigns >= subscription.plan.campaignLimit) {
    throw new ForbiddenError(
      `Your ${subscription.plan.name} plan allows ${subscription.plan.campaignLimit} active campaign${
        subscription.plan.campaignLimit === 1 ? "" : "s"
      }. Upgrade to post more.`
    );
  }

  return subscription;
}
