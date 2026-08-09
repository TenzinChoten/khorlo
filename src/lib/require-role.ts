import { getCurrentUser } from "@/src/lib/auth";
import type { UserDTO } from "@/src/types";
import { ForbiddenError } from "@/src/types";
import type { Role } from "@/app/generated/prisma/enums";

/**
 * Authenticates the current user and enforces role-based access.
 * Throws UnauthorizedError if not logged in, ForbiddenError if wrong role.
 */
export async function requireRole(...roles: Role[]): Promise<UserDTO> {
  const user = await getCurrentUser();

  if (!roles.includes(user.role)) {
    throw new ForbiddenError(
      `This action requires one of the following roles: ${roles.join(", ")}`
    );
  }

  return user;
}
