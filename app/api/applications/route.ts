import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/src/services/application.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await applicationService.apply(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
