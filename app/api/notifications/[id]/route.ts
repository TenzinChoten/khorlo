import { NextResponse } from "next/server";
import { notificationService } from "@/src/services/notification.service";
import { handleApiError } from "@/src/utils/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    await notificationService.deleteNotification(id);

    return NextResponse.json({ message: "Notification deleted." }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
