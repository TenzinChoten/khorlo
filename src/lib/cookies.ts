import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "auth_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// [Reason] Vercel SPA and Render API are different sites; Lax cookies are omitted on cross-origin fetch
export function authCookieOptions(maxAge = MAX_AGE) {
  const crossSite = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    path: "/",
    maxAge,
    secure: crossSite,
    sameSite: (crossSite ? "none" : "lax") as "none" | "lax",
  };
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
