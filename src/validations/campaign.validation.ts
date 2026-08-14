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

// [Reason] Empty URL params should be omitted so optional enums do not 400
const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

// [Reason] Niches/formats arrive as comma-separated query strings from the discovery UI
const csvStringArray = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return value;
}, z.array(z.string().min(1).max(100)).max(50).optional());

const optionalTrimmedString = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).max(200).optional()
);

export const campaignQuerySchema = z.preprocess((raw) => {
  // [Reason] Accept `search` as an alias of `keyword` used by the existing frontend
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const params = { ...(raw as Record<string, unknown>) };
    if (!params.keyword && params.search) {
      params.keyword = params.search;
    }
    return params;
  }
  return raw;
}, z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: optionalTrimmedString,
  keyword: optionalTrimmedString,
  country: optionalTrimmedString,
  state: optionalTrimmedString,
  city: optionalTrimmedString,
  locationType: z.preprocess(
    emptyToUndefined,
    z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional()
  ),
  compensationType: z.preprocess(
    emptyToUndefined,
    z.enum(["PAID", "FREE_PRODUCT", "PAID_AND_PRODUCT"]).optional()
  ),
  // [Reason] Numeric budget exists on Campaign, so min compensation can be filtered in SQL
  minBudget: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  }, z.union([
    z.undefined(),
    z.coerce.number().nonnegative("Minimum compensation must be 0 or greater"),
  ])),
  niches: csvStringArray,
  formats: csvStringArray,
  contentNiche: optionalTrimmedString,
  contentFormat: optionalTrimmedString,
  // [Reason] Status remains parseable so invalid values 400, but discovery always forces OPEN
  status: z.preprocess(
    emptyToUndefined,
    z.enum(["DRAFT", "OPEN", "CLOSED", "COMPLETED", "CANCELLED"]).optional()
  ),
  deadline: z.preprocess(
    emptyToUndefined,
    z.enum(["soon", "7", "30", "all"]).optional()
  ),
  sort: z.preprocess(
    emptyToUndefined,
    z.enum(["newest", "oldest", "budget_asc", "budget_desc", "deadline"]).default("newest")
  ),
}));

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CampaignQueryInput = z.infer<typeof campaignQuerySchema>;
