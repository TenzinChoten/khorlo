import type {
  BillingCycle,
  SubscriptionStatus,
} from "@/app/generated/prisma/enums";

export interface PlanDTO {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  campaignLimit: number;
  messageLimit: number;
  advancedSearch: boolean;
  featuredCampaigns: boolean;
  razorpayPlanId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionDTO {
  id: string;
  businessId: string;
  planId: string;
  razorpaySubscriptionId: string | null;
  startsAt: Date;
  // [Reason] Free plans omit a renew/end date so the API can return null
  expiresAt: Date | null;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
  plan: PlanDTO;
}

export interface PlanListResponse {
  plans: PlanDTO[];
}

export interface PlanUsageDTO {
  activeCampaigns: number;
  campaignLimit: number;
  messagesThisMonth: number;
  messageLimit: number;
}

export interface SubscriptionResponse {
  subscription: SubscriptionDTO;
  usage?: PlanUsageDTO;
}

export interface SubscriptionListResponse {
  subscriptions: SubscriptionDTO[];
}

export interface CreateSubscriptionResponse {
  subscription: SubscriptionDTO;
  // [Reason] Checkout only needs the public key and Razorpay subscription id — never the secret
  checkout: {
    keyId: string | null;
    razorpaySubscriptionId: string | null;
  } | null;
}
