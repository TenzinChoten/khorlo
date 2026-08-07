import { hashPassword, comparePassword } from "@/src/lib/password";
import { generateAccessToken } from "@/src/lib/jwt";
import { setAuthCookie, removeAuthCookie } from "@/src/lib/cookies";
import { getCurrentUser } from "@/src/lib/auth";
import { userRepository } from "@/src/repositories/user.repository";
import {
  registerSchema,
  loginSchema,
} from "@/src/validations/auth.validation";
import type { AuthResponse } from "@/src/types";
import {
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from "@/src/types";

export const authService = {
  async register(body: unknown): Promise<AuthResponse> {
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      throw new ValidationError("Invalid registration data", errors);
    }

    const { name, email, password, role } = result.data;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("A user with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await userRepository.createUser({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = await generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    await setAuthCookie(token);

    return { user };
  },

  async login(body: unknown): Promise<AuthResponse> {
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      throw new ValidationError("Invalid login data", errors);
    }

    const { email, password } = result.data;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = await generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    await setAuthCookie(token);

    // Return user without password
    const { password: _, ...userDTO } = user;

    return { user: userDTO };
  },

  async logout(): Promise<void> {
    await removeAuthCookie();
  },

  async me(): Promise<AuthResponse> {
    const user = await getCurrentUser();
    return { user };
  },
};
