import { NextRequest, NextResponse } from "next/server";
import { messageService } from "@/src/services/message.service";
import { handleApiError } from "@/src/utils/api-error-handler";

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { conversationId } = await context.params;
    const queryParams = Object.fromEntries(request.nextUrl.searchParams);
    const result = await messageService.getMessages(conversationId, queryParams);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { conversationId } = await context.params;
    const body = await request.json();
    const result = await messageService.sendMessage(conversationId, body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
