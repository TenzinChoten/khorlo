import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsHeaders, getAllowedOrigin } from "@/src/lib/cors";

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    // [Reason] Reject unknown origins on preflight so credentialed browsers never pair * with cookies
    if (origin && !getAllowedOrigin(origin)) {
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, {
      status: 204,
      headers,
    });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
