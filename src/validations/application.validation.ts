import { z } from "zod";

export const createApplicationSchema = z.object({
  campaignId: z
    .string()
    .min(1, "Campaign ID is required")
    .trim(),
  coverLetter: z
    .string()
    .min(1, "Cover letter is required")
    .max(5000, "Cover letter must be 5000 characters or less")
    .trim()
    .optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"], {
    error: "Status must be ACCEPTED or REJECTED",
  }),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
