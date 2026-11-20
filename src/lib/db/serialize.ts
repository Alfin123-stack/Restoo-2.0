import type { RestaurantDoc } from "@/lib/db/models/restaurant";
import type { ReviewDoc } from "@/lib/db/models/review";
import type { RestaurantDTO, ReviewDTO } from "@/types";

export function averageRating(sum: number, count: number): number | null {
  if (!count) return null;
  return Math.round((sum / count) * 10) / 10;
}

/** Mengubah dokumen Mongoose (lean) menjadi objek polos yang aman di-cache & dikirim ke client. */
export function toRestaurantDTO(
  doc: RestaurantDoc & { distance?: number },
): RestaurantDTO {
  const coords = doc.location?.coordinates;
  return {
    id: String(doc._id),
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? null,
    address: doc.address ?? "",
    city: doc.city ?? "",
    categories: doc.categories ?? [],
    coordinates: coords && coords.length === 2 ? [coords[0], coords[1]] : null,
    openingHours: doc.openingHours ?? null,
    phone: doc.phone ?? null,
    website: doc.website ?? null,
    pictureUrl: doc.pictureUrl ?? null,
    pictureUrls: [...new Set([doc.pictureUrl, ...(doc.pictureUrls ?? [])].filter((u): u is string => !!u))].slice(0, 9),
    menus: { foods: doc.menus?.foods ?? [], drinks: doc.menus?.drinks ?? [] },
    rating: averageRating(doc.ratingSum ?? 0, doc.ratingCount ?? 0),
    ratingCount: doc.ratingCount ?? 0,
    priceLevel: doc.priceLevel ?? null,
    tags: doc.tags ?? [],
    ...(typeof doc.distance === "number"
      ? { distanceKm: Math.round(doc.distance / 100) / 10 }
      : {}),
  };
}

export function toReviewDTO(doc: ReviewDoc): ReviewDTO {
  return {
    id: String(doc._id),
    name: doc.name,
    rating: doc.rating,
    comment: doc.comment,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}
