import { z } from "zod";

export const createReviewSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  revieweeId: z.string().min(1, "Reviewee ID is required"),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000, "Review is too long").optional().nullable(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
