import { prisma } from "@/src/lib/prisma";
import type { UserDTO } from "@/src/types";
import type { Role } from "@/app/generated/prisma/enums";

/** Fields returned for all user queries — never includes password */
const userSelectDTO = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Raw user with password — only used internally by the service layer for auth verification */
export interface UserWithPassword {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<UserDTO | null> {
    return prisma.user.findUnique({
      where: { id },
      select: userSelectDTO,
    });
  },

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }): Promise<UserDTO> {
    return prisma.user.create({
      data,
      select: userSelectDTO,
    });
  },
};
