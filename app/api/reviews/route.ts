import { NextRequest, NextResponse } from "next/server";
import { reviewService } from "@/src/services/review.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await reviewService.createReview(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
