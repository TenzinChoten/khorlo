import { getAuthCookie } from "@/src/lib/cookies";
import { verifyAccessToken } from "@/src/lib/jwt";
import { userRepository } from "@/src/repositories/user.repository";
import type { UserDTO } from "@/src/types";
import { UnauthorizedError } from "@/src/types";

/**
 * Reads the auth cookie, verifies the JWT, and returns the authenticated user.
 * Throws UnauthorizedError if the token is missing, invalid, or the user doesn't exist.
 */
export async function getCurrentUser(): Promise<UserDTO> {
  const token = await getAuthCookie();

  if (!token) {
    throw new UnauthorizedError("Unauthenticated");
  }

  try {
    const payload = await verifyAccessToken(token);
    // [Reason] Support both `id` and legacy `userId` claims so existing sessions still authenticate
    const userId = payload.id || (payload as { userId?: string }).userId;
    if (!userId) {
      throw new UnauthorizedError("Unauthenticated");
    }
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError("Unauthenticated");
    }

    return user;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      console.error("Auth misconfiguration: JWT_SECRET is not set");
    }
    throw new UnauthorizedError("Unauthenticated");
  }
}
