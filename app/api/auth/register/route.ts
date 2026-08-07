import { NextResponse } from "next/server";
import { authService } from "@/src/services/auth.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await authService.register(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
