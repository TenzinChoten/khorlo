import { NextResponse } from "next/server";
import { notificationService } from "@/src/services/notification.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function GET(): Promise<NextResponse> {
  try {
    const result = await notificationService.getUnreadCount();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
