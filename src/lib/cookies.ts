import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "auth_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function isCrossSiteAuth(): boolean {
  if (process.env.AUTH_COOKIE_SAMESITE === "none") return true;
  if (process.env.AUTH_COOKIE_SAMESITE === "lax") return false;
  return process.env.NODE_ENV === "production";
}

// [Reason] Vercel SPA and Render API are different sites; Lax cookies are omitted on cross-origin fetch
export function authCookieOptions(maxAge = MAX_AGE) {
  const crossSite = isCrossSiteAuth();
  return {
    httpOnly: true,
    path: "/",
    maxAge,
    secure: crossSite,
    sameSite: (crossSite ? "none" : "lax") as "none" | "lax",
    // [Reason] CHIPS keeps the cookie available on credentialed fetches from khorlo.vercel.app
    partitioned: crossSite,
  };
}

export function applyAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", authCookieOptions(0));
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, authCookieOptions());
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", authCookieOptions(0));
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}
