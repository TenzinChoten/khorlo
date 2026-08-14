import { NextRequest, NextResponse } from "next/server";
import { campaignService } from "@/src/services/campaign.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // [Reason] Reuse the public campaign DTO so share pages never leak private business or application fields
    const result = await campaignService.getById(id);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
