import { requireRole } from "@/src/lib/require-role";
import { reviewRepository } from "@/src/repositories/review.repository";
import { createReviewSchema } from "@/src/validations/review.validation";
import { prisma } from "@/src/lib/prisma";
import { notificationService } from "@/src/services/notification.service";
import type {
  ReviewListResponse,
  UserReviewStatsResponse,
  ReviewResponse,
} from "@/src/types/review";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "@/src/types";

function parseValidation<T>(
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } },
  body: unknown,
  message: string
): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError(
      message,
      result.error.flatten().fieldErrors as Record<string, string[]>
    );
  }
  return result.data;
}

export const reviewService = {
  async createReview(body: unknown): Promise<ReviewResponse> {
    const user = await requireRole("INFLUENCER", "BUSINESS");
    const data = parseValidation(createReviewSchema, body, "Invalid review data");

    if (user.id === data.revieweeId) {
      throw new ConflictError("You cannot review yourself.");
    }

    // Check if review already exists
    const exists = await reviewRepository.checkExists(data.campaignId, user.id, data.revieweeId);
    if (exists) {
      throw new ConflictError("You have already reviewed this user for this campaign.");
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
      select: { id: true },
    });
    if (!campaign) {
      throw new NotFoundError("Campaign not found.");
    }

    // Verify participation in an ACCEPTED application
    // We check if there's an application for this campaign where status is ACCEPTED
    // and the influencer user ID and business user ID match the reviewer and reviewee
    const applications = await prisma.application.findMany({
      where: {
        campaignId: data.campaignId,
        status: "ACCEPTED",
        OR: [
          // If reviewer is influencer and reviewee is business
          {
            influencer: { userId: user.id },
            campaign: { business: { userId: data.revieweeId } },
          },
          // If reviewer is business and reviewee is influencer
          {
            campaign: { business: { userId: user.id } },
            influencer: { userId: data.revieweeId },
          },
        ],
      },
    });

    if (applications.length === 0) {
      throw new ForbiddenError(
        "You can only review users you have successfully collaborated with on this campaign."
      );
    }

    const review = await reviewRepository.create(user.id, data);

    // Notify the reviewee
    await notificationService.createNotification(
      data.revieweeId,
      "New Review Received",
      "Someone has left a review on your profile.",
      "REVIEW"
    );

    return { review };
  },

  async getUserReviews(userId: string): Promise<UserReviewStatsResponse> {
    // GET endpoints are public
    return reviewRepository.getUserReviewStats(userId);
  },

  async getCampaignReviews(campaignId: string): Promise<ReviewListResponse> {
    // GET endpoints are public
    const reviews = await reviewRepository.findByCampaignId(campaignId);
    return { reviews };
  },

  async deleteReview(id: string): Promise<void> {
    const user = await requireRole("INFLUENCER", "BUSINESS");

    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundError("Review not found.");
    }

    if (review.reviewerId !== user.id) {
      throw new ForbiddenError("You can only delete your own reviews.");
    }

    await reviewRepository.delete(id);
  },
};
