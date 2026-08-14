import { planRepository } from "@/src/repositories/plan.repository";
import type { PlanListResponse } from "@/src/types/subscription";

export const planService = {
  async listActive(): Promise<PlanListResponse> {
    const plans = await planRepository.findActive();
    return { plans };
  },
};
