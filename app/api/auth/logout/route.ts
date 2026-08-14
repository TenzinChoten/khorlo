import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/src/lib/cookies";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  // [Reason] Cookie must be cleared with the same flags login used or the browser keeps auth_token
  response.cookies.set(AUTH_COOKIE_NAME, "", authCookieOptions(0));
  return response;
}
