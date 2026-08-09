import { NextResponse } from "next/server";
import { applicationService } from "@/src/services/application.service";
import { handleApiError } from "@/src/utils/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const result = await applicationService.getApplicationById(id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    await applicationService.deleteApplication(id);

    return NextResponse.json(
      { message: "Application withdrawn successfully" },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
