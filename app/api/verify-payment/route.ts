import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/src/services/payment.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await paymentService.verifyPayment(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
