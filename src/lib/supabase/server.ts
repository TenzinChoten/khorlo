import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/src/types";

export class SupabaseConfigError extends AppError {
  constructor(message = "Supabase is not configured") {
    super(message, 503, "SUPABASE_NOT_CONFIGURED");
  }
}

function requireEnv(name: "SUPABASE_URL" | "SUPABASE_SECRET_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new SupabaseConfigError(`${name} is not set`);
  }
  return value;
}

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Server-only Supabase client using SUPABASE_SECRET_KEY.
 * Must never be imported from frontend or any Vite/browser bundle.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = requireEnv("SUPABASE_URL");
    const secretKey = requireEnv("SUPABASE_SECRET_KEY");
    supabaseAdmin = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdmin;
}

export function getSupabaseUrl(): string {
  return requireEnv("SUPABASE_URL");
}
