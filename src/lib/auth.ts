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
    throw new UnauthorizedError("Authentication required");
  }

  try {
    const payload = await verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return user;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError("Invalid or expired token");
  }
}
