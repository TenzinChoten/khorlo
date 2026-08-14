import { z } from "zod";
import { isPublicHttpUrl } from "@/src/lib/public-url";

const publicWebsite = z
  .string()
  .trim()
  .nullish()
  .refine((value) => !value || isPublicHttpUrl(value), "Enter a public https website URL");

export const createBusinessProfileSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be 200 characters or less")
    .trim(),
  companyDescription: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .trim()
    .optional(),
  website: publicWebsite,
  companyLogo: z.url("Invalid URL format").optional(),
  country: z.string().max(100).trim().optional(),
  state: z.string().max(100).trim().optional(),
  city: z.string().max(100).trim().optional(),
});

export const updateBusinessProfileSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be 200 characters or less")
    .trim()
    .optional(),
  companyDescription: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .trim()
    .nullish(),
  website: publicWebsite,
  companyLogo: z.url("Invalid URL format").nullish(),
  country: z.string().max(100).trim().nullish(),
  state: z.string().max(100).trim().nullish(),
  city: z.string().max(100).trim().nullish(),
});

export type CreateBusinessProfileInput = z.infer<
  typeof createBusinessProfileSchema
>;
export type UpdateBusinessProfileInput = z.infer<
  typeof updateBusinessProfileSchema
>;
