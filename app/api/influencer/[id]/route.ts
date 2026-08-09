import { NextResponse } from "next/server";
import { influencerService } from "@/src/services/influencer.service";
import { handleApiError } from "@/src/utils/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const result = await influencerService.getPublicProfile(id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
