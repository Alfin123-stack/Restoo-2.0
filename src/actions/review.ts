"use server";

import { headers } from "next/headers";
import { updateTag } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { connectDB } from "@/lib/db/connect";
import { Restaurant } from "@/lib/db/models/restaurant";
import { Review } from "@/lib/db/models/review";
import { moderateReview } from "@/lib/ai/moderate";
import { buildRateLimitKey, consumeRateLimit } from "@/lib/rate-limit";
import { reviewSchema, type ReviewFormState } from "@/lib/validation/review";

const REVIEW_LIMIT = Number(process.env.REVIEW_RATE_LIMIT) || 3; // max reviews per time window
const REVIEW_WINDOW_SECONDS = 60 * 60;

const clean = (value: string) =>
  sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

export async function submitReview(
  _previous: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const raw = {
    restaurantId: String(formData.get("restaurantId") ?? ""),
    name: String(formData.get("name") ?? ""),
    rating: String(formData.get("rating") ?? ""),
    comment: String(formData.get("comment") ?? ""),
    website: String(formData.get("website") ?? ""),
  };
  const values = { name: raw.name, rating: raw.rating, comment: raw.comment };

  // Honeypot filled => likely a bot. Reply as if it succeeded so the bot learns nothing.
  if (raw.website) return { status: "success", message: "Thanks for your review!" };

  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: NonNullable<ReviewFormState["fieldErrors"]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        (field === "name" || field === "rating" || field === "comment") &&
        !fieldErrors[field]
      ) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please check the form again.",
      fieldErrors,
      values,
    };
  }

  const { restaurantId, rating } = parsed.data;
  const name = clean(parsed.data.name);
  const comment = clean(parsed.data.comment);
  if (name.length < 2 || comment.length < 5) {
    return {
      status: "error",
      message: "Please remove characters like < and > from your review.",
      values,
    };
  }

  const moderation = await moderateReview(`${name}\n${comment}`);
  if (!moderation.allowed) {
    return {
      status: "error",
      message:
        "This review looks like spam or contains abusive language, so it wasn't posted. Please edit it and try again.",
      values,
    };
  }

  try {
    await connectDB();

    const requestHeaders = await headers();
    const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const allowed = await consumeRateLimit(
      buildRateLimitKey(ip, "review"),
      REVIEW_LIMIT,
      REVIEW_WINDOW_SECONDS,
    );
    if (!allowed) {
      return {
        status: "error",
        message: "You're sending reviews too often. Try again in an hour.",
        values,
      };
    }

    const restaurant = await Restaurant.findById(restaurantId).select("slug").lean();
    if (!restaurant) return { status: "error", message: "Restaurant not found.", values };

    await Review.create({ restaurantId, name, rating, comment });
    await Restaurant.updateOne(
      { _id: restaurantId },
      { $inc: { ratingSum: rating, ratingCount: 1 } },
    );

    // Read-your-own-writes: the new review and rating show up immediately.
    updateTag(`reviews:${restaurantId}`);
    updateTag(`restaurant:${restaurant.slug}`);
    updateTag("restaurants");
  } catch (error) {
    console.error("submitReview failed", error);
    return {
      status: "error",
      message: "Your review wasn't sent. Please try again shortly.",
      values,
    };
  }

  return { status: "success", message: "Thanks for your review!" };
}
