import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { Review, type ReviewDoc } from "@/lib/db/models/review";
import { toReviewDTO } from "@/lib/db/serialize";
import type { ReviewDTO } from "@/types";

export async function listReviews(
  restaurantId: string,
  limit = 20,
): Promise<ReviewDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(`reviews:${restaurantId}`);

  await connectDB();
  const docs = await Review.find({ restaurantId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<ReviewDoc[]>();
  return docs.map(toReviewDTO);
}
