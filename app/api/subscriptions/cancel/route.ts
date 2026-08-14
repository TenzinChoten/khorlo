import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/src/services/subscription.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await subscriptionService.cancel(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
