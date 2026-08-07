import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/src/services/notification.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const result = await notificationService.getMyNotifications(searchParams);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
