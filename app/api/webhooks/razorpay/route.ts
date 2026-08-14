import { NextRequest, NextResponse } from "next/server";
import { razorpayWebhookService } from "@/src/services/razorpay-webhook.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // [Reason] Signature verification must use the exact raw body Razorpay signed
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const eventId = request.headers.get("x-razorpay-event-id");
    const result = await razorpayWebhookService.handle(rawBody, signature, eventId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
