import { NextResponse } from "next/server";
import { messageService } from "@/src/services/message.service";
import { handleApiError } from "@/src/utils/api-error-handler";

interface RouteContext {
  params: Promise<{ messageId: string }>;
}

export async function PATCH(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { messageId } = await context.params;
    const result = await messageService.markMessageAsRead(messageId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
