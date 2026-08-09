import { NextResponse } from "next/server";
import { notificationService } from "@/src/services/notification.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function PATCH(): Promise<NextResponse> {
  try {
    await notificationService.markAllAsRead();

    return NextResponse.json({ message: "All notifications marked as read." }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
