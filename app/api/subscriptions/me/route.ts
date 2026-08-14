import { NextResponse } from "next/server";
import { subscriptionService } from "@/src/services/subscription.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function GET(): Promise<NextResponse> {
  try {
    const result = await subscriptionService.getMine();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
