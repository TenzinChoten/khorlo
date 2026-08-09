import { NextResponse } from "next/server";
import { influencerService } from "@/src/services/influencer.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await influencerService.createProfile(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
