import { NextResponse } from "next/server";
import { reviewService } from "@/src/services/review.service";
import { handleApiError } from "@/src/utils/api-error-handler";

interface RouteContext {
  params: Promise<{ campaignId: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { campaignId } = await context.params;
    const result = await reviewService.getCampaignReviews(campaignId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
