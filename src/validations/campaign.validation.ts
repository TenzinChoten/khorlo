import { z } from "zod";

// ─────────────────────────────────────────────
// Create Campaign
// ─────────────────────────────────────────────

export const createCampaignSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be 5000 characters or less")
    .trim(),
  productName: z.string().max(200).trim().optional(),
  compensationType: z.enum(["PAID", "FREE_PRODUCT", "PAID_AND_PRODUCT"], {
    error: "Invalid compensation type",
  }),
  budget: z.number().positive("Budget must be positive").optional(),
  currency: z.string().max(10).trim().optional(),
  creatorSlots: z.number().int().positive("Creator slots must be positive").optional(),
  applicationDeadline: z.coerce.date().optional(),
  contentDeadline: z.coerce.date().optional(),
  locationType: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional(),
  country: z.string().max(100).trim().optional(),
  state: z.string().max(100).trim().optional(),
  city: z.string().max(100).trim().optional(),
  address: z.string().max(500).trim().optional(),
  status: z.enum(["DRAFT", "OPEN"]).optional(),

  images: z.array(z.url("Invalid image URL")).optional(),

  contentNiches: z
    .array(z.string().min(1).max(100).trim())
    .optional(),

  contentFormats: z
    .array(
      z.object({
        format: z.string().min(1, "Format name is required").max(100).trim(),
        quantity: z.number().int().positive("Quantity must be positive").default(1),
      })
    )
    .optional(),
});

// ─────────────────────────────────────────────
// Update Campaign
// ─────────────────────────────────────────────

export const updateCampaignSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be 5000 characters or less")
    .trim()
    .optional(),
  productName: z.string().max(200).trim().nullish(),
  compensationType: z
    .enum(["PAID", "FREE_PRODUCT", "PAID_AND_PRODUCT"])
    .optional(),
  budget: z.number().positive("Budget must be positive").nullish(),
  currency: z.string().max(10).trim().nullish(),
  creatorSlots: z.number().int().positive().optional(),
  applicationDeadline: z.coerce.date().nullish(),
  contentDeadline: z.coerce.date().nullish(),
  locationType: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional(),
  country: z.string().max(100).trim().nullish(),
  state: z.string().max(100).trim().nullish(),
  city: z.string().max(100).trim().nullish(),
  address: z.string().max(500).trim().nullish(),
  status: z
    .enum(["DRAFT", "OPEN", "CLOSED", "COMPLETED", "CANCELLED"])
    .optional(),

  images: z.array(z.url("Invalid image URL")).optional(),

  contentNiches: z
    .array(z.string().min(1).max(100).trim())
    .optional(),

  contentFormats: z
    .array(
      z.object({
        format: z.string().min(1).max(100).trim(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .optional(),
});

// ─────────────────────────────────────────────
// Query Filters
// ─────────────────────────────────────────────

export const campaignQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  keyword: z.string().trim().optional(),
  country: z.string().trim().optional(),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
  locationType: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional(),
  compensationType: z
    .enum(["PAID", "FREE_PRODUCT", "PAID_AND_PRODUCT"])
    .optional(),
  contentNiche: z.string().trim().optional(),
  contentFormat: z.string().trim().optional(),
  status: z
    .enum(["DRAFT", "OPEN", "CLOSED", "COMPLETED", "CANCELLED"])
    .optional(),
  sort: z
    .enum(["newest", "oldest", "budget_asc", "budget_desc"])
    .default("newest"),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CampaignQueryInput = z.infer<typeof campaignQuerySchema>;
