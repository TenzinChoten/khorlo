import { NextResponse } from "next/server";
import { messageService } from "@/src/services/message.service";
import { handleApiError } from "@/src/utils/api-error-handler";

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { conversationId } = await context.params;
    const result = await messageService.getConversation(conversationId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
