import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { ReviewDTO, RatingDistribution, UserReviewStatsResponse } from "@/src/types/review";
import type { CreateReviewInput } from "@/src/validations/review.validation";

// ─────────────────────────────────────────────
// DTO Mappers
// ─────────────────────────────────────────────

function toDTO(review: Prisma.ReviewGetPayload<{}>): ReviewDTO {
  return {
    id: review.id,
    campaignId: review.campaignId,
    reviewerId: review.reviewerId,
    revieweeId: review.revieweeId,
    rating: review.rating,
    review: review.review,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

// ─────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────

export const reviewRepository = {
  async create(reviewerId: string, data: CreateReviewInput): Promise<ReviewDTO> {
    const review = await prisma.review.create({
      data: {
        campaignId: data.campaignId,
        revieweeId: data.revieweeId,
        reviewerId,
        rating: data.rating,
        review: data.review,
      },
    });
    return toDTO(review);
  },

  async findByCampaignId(campaignId: string): Promise<ReviewDTO[]> {
    const reviews = await prisma.review.findMany({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
    });
    return reviews.map(toDTO);
  },

  async getUserReviewStats(userId: string): Promise<UserReviewStatsResponse> {
    // 1. Get raw reviews
    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      orderBy: { createdAt: "desc" },
    });

    // 2. Get aggregates (average rating & total reviews)
    const aggregate = await prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: true,
    });

    // 3. Get rating distribution using groupBy
    const distribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { revieweeId: userId },
      _count: true,
    });

    const ratingDistribution: RatingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    distribution.forEach((item) => {
      if (item.rating >= 1 && item.rating <= 5) {
        ratingDistribution[item.rating as keyof RatingDistribution] = item._count;
      }
    });

    return {
      averageRating: aggregate._avg.rating,
      totalReviews: aggregate._count,
      ratingDistribution,
      reviews: reviews.map(toDTO),
    };
  },

  async findById(id: string): Promise<ReviewDTO | null> {
    const review = await prisma.review.findUnique({
      where: { id },
    });
    return review ? toDTO(review) : null;
  },

  async delete(id: string): Promise<void> {
    await prisma.review.delete({
      where: { id },
    });
  },

  async checkExists(campaignId: string, reviewerId: string, revieweeId: string): Promise<boolean> {
    const count = await prisma.review.count({
      where: { campaignId, reviewerId, revieweeId },
    });
    return count > 0;
  },
};
