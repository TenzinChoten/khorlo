export interface ReviewDTO {
  id: string;
  campaignId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  review: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface UserReviewStatsResponse {
  averageRating: number | null;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  reviews: ReviewDTO[];
}

export interface ReviewListResponse {
  reviews: ReviewDTO[];
}

export interface ReviewResponse {
  review: ReviewDTO;
}
