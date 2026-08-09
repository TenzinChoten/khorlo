import { NextResponse } from "next/server";
import { AppError } from "@/src/types";

/**
 * Converts service-layer errors into consistent JSON responses.
 * AppError subclasses carry their own status codes; unknown errors become 500s.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...("errors" in error
            ? { errors: (error as { errors: unknown }).errors }
            : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  console.error("Unhandled error:", error);

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}
