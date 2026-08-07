import { NextResponse } from "next/server";
import { messageService } from "@/src/services/message.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function GET(): Promise<NextResponse> {
  try {
    const result = await messageService.getMyConversations();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
