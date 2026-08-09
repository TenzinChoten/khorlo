import { z } from "zod";

const socialAccountSchema = z.object({
  platform: z.enum(
    ["INSTAGRAM", "TIKTOK", "YOUTUBE", "LINKEDIN", "X", "FACEBOOK"],
    { error: "Invalid platform" }
  ),
  username: z
    .string()
    .min(1, "Username is required")
    .max(100)
    .trim(),
  url: z.url("Invalid URL").optional(),
  followers: z.number().int().min(0).default(0),
  engagementRate: z.number().min(0).max(100).default(0),
});

const portfolioItemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200)
    .trim(),
  description: z.string().max(2000).trim().optional(),
  thumbnailUrl: z.url("Invalid URL").optional(),
  mediaUrl: z.url("Invalid URL").optional(),
});

// ─────────────────────────────────────────────
// Create Profile
// ─────────────────────────────────────────────

export const createInfluencerProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or less")
    .trim(),
  profilePhoto: z.url("Invalid URL").optional(),
  bio: z.string().max(2000).trim().optional(),
  age: z.number().int().positive().max(120).optional(),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]).optional(),
  country: z.string().max(100).trim().optional(),
  state: z.string().max(100).trim().optional(),
  city: z.string().max(100).trim().optional(),
  ethnicity: z.string().max(100).trim().optional(),
  previousBrands: z.string().max(2000).trim().optional(),

  socialAccounts: z.array(socialAccountSchema).optional(),

  contentNiches: z
    .array(z.string().min(1).max(100).trim())
    .optional(),

  contentFormats: z
    .array(z.string().min(1).max(100).trim())
    .optional(),

  portfolio: z.array(portfolioItemSchema).optional(),
});

// ─────────────────────────────────────────────
// Update Profile
// ─────────────────────────────────────────────

export const updateInfluencerProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100)
    .trim()
    .optional(),
  profilePhoto: z.url("Invalid URL").nullish(),
  bio: z.string().max(2000).trim().nullish(),
  age: z.number().int().positive().max(120).nullish(),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]).nullish(),
  country: z.string().max(100).trim().nullish(),
  state: z.string().max(100).trim().nullish(),
  city: z.string().max(100).trim().nullish(),
  ethnicity: z.string().max(100).trim().nullish(),
  previousBrands: z.string().max(2000).trim().nullish(),

  socialAccounts: z.array(socialAccountSchema).optional(),

  contentNiches: z
    .array(z.string().min(1).max(100).trim())
    .optional(),

  contentFormats: z
    .array(z.string().min(1).max(100).trim())
    .optional(),

  portfolio: z.array(portfolioItemSchema).optional(),
});

export type CreateInfluencerProfileInput = z.infer<typeof createInfluencerProfileSchema>;
export type UpdateInfluencerProfileInput = z.infer<typeof updateInfluencerProfileSchema>;
export type SocialAccountInput = z.infer<typeof socialAccountSchema>;
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
