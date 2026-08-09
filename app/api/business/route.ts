import { NextResponse } from "next/server";
import { businessService } from "@/src/services/business.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await businessService.createProfile(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
