import { NextResponse } from "next/server";
import { applicationService } from "@/src/services/application.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function GET(): Promise<NextResponse> {
  try {
    const result = await applicationService.getMyApplications();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
