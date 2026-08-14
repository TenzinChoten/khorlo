import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface TokenPayload extends JWTPayload {
  id: string;
  role: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

const DEFAULT_EXPIRATION = "7d";

export async function generateAccessToken(
  payload: Omit<TokenPayload, "iat" | "exp">
): Promise<string> {
  const expiration = process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRATION;

  return new SignJWT(payload)
    // [Reason] HS256 matches the previous jsonwebtoken sessions so existing cookies still verify
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  // [Reason] Small skew avoids false 401s when Render and the browser clock differ by a few seconds
  const { payload } = await jwtVerify(token, getSecret(), { clockTolerance: 5 });
  const id = typeof payload.id === "string" ? payload.id : undefined;
  const role = typeof payload.role === "string" ? payload.role : undefined;
  if (!id || !role) {
    throw new Error("Token is missing required claims");
  }
  return { ...payload, id, role };
}
