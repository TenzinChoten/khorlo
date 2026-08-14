const DEFAULT_ALLOWED_ORIGINS = [
  "https://khorlo.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// [Reason] Credentialed CORS cannot use *; only listed frontend origins may receive ACAO
export function getAllowedOrigins(): string[] {
  const extra = [
    process.env.CORS_ORIGINS,
    process.env.FRONTEND_ORIGIN,
    process.env.NEXT_PUBLIC_FRONTEND_URL,
  ]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...extra])];
}

export function getAllowedOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  return getAllowedOrigins().includes(requestOrigin) ? requestOrigin : null;
}

export function corsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = getAllowedOrigin(requestOrigin);
  if (!origin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
