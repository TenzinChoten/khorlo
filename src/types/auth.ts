import type { Role } from "@/app/generated/prisma/enums";

/** Safe user representation — never includes password hash */
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: UserDTO;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "BUSINESS" | "INFLUENCER";
}

export interface LoginInput {
  email: string;
  password: string;
}
