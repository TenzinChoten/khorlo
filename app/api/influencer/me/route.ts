import { NextResponse } from "next/server";
import { influencerService } from "@/src/services/influencer.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function GET(): Promise<NextResponse> {
  try {
    const result = await influencerService.getMyProfile();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await influencerService.updateMyProfile(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
