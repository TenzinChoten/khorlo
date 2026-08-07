import { NextRequest, NextResponse } from "next/server";
import { campaignService } from "@/src/services/campaign.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await campaignService.create(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const result = await campaignService.list(request.nextUrl.searchParams);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
