import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/src/lib/cookies";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  // [Reason] Cookie must be cleared with the same flags login used or the browser keeps auth_token
  clearAuthCookie(response);
  return response;
}
