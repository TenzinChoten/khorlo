import { NextResponse } from "next/server";
import { authService } from "@/src/services/auth.service";
import { handleApiError } from "@/src/utils/api-error-handler";

export async function POST(): Promise<NextResponse> {
  try {
    await authService.logout();

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
