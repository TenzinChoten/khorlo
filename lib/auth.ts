import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

export interface JwtPayload {
  id: string;
  role: string;
}

export function getAuthUser(request: NextRequest): JwtPayload | null {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
