import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { PipelineStage, QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Restaurant, type RestaurantDoc } from "@/lib/db/models/restaurant";
import { Review } from "@/lib/db/models/review";
import { toRestaurantDTO } from "@/lib/db/serialize";
import { escapeRegex } from "@/lib/format";
import type { Paginated, RestaurantDTO } from "@/types";

export const PAGE_SIZE = 12;
/** Batas kandidat untuk filter "buka sekarang" dan tampilan peta. */
export const MAX_CANDIDATES = 300;

export type ListParams = {
  q?: string;
  city?: string;
  category?: string;
  tag?: string;
  minRating?: number;
  maxPrice?: number;
  near?: { lat: number; lng: number; radiusKm: number };
  page?: number;
};

type FilterOptions = { withRating?: boolean };

function buildFilter(
  { q, city, category, tag, maxPrice, minRating }: ListParams,
  { withRating = true }: FilterOptions = {},
): QueryFilter<RestaurantDoc> {
  const filter: QueryFilter<RestaurantDoc> = {};
  const term = q?.trim();
  if (term) {
    const rx = new RegExp(escapeRegex(term), "i");
    filter.$or = [
      { name: rx },
      { address: rx },
      { city: rx },
      { categories: rx },
      { "menus.foods": rx },
      { "menus.drinks": rx },
    ];
  }
  if (city) filter.city = city;
  if (category) filter.categories = category;
  if (tag) filter.tags = tag;
  if (maxPrice)
    filter.priceLevel = { $in: ([1, 2, 3] as const).filter((p) => p <= maxPrice) };
  if (withRating && minRating) {
    filter.ratingCount = { $gt: 0 };
    filter.$expr = {
      $gte: [{ $divide: ["$ratingSum", { $max: ["$ratingCount", 1] }] }, minRating],
    };
  }
  return filter;
}

function paginate<T>(items: T[], total: number, page: number): Paginated<T> {
  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Daftar biasa dengan pagination di database. Di-cache; jangan dipakai untuk hasil yang bergantung waktu. */
export async function listRestaurants(
  params: ListParams,
): Promise<Paginated<RestaurantDTO>> {
  "use cache";
  cacheLife("hours");
  cacheTag("restaurants");

  await connectDB();
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const filter = buildFilter(params);
  const [docs, total] = await Promise.all([
    Restaurant.find(filter)
      .sort({ ratingCount: -1, name: 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<RestaurantDoc[]>(),
    Restaurant.countDocuments(filter),
  ]);
  return paginate(docs.map(toRestaurantDTO), total, page);
}

/** Semua kandidat yang cocok (maks. MAX_CANDIDATES). Dipakai untuk peta dan filter "buka sekarang". */
export async function listAllMatching(params: ListParams): Promise<RestaurantDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("restaurants");

  await connectDB();
  const docs = await Restaurant.find(buildFilter(params))
    .sort({ ratingCount: -1, name: 1 })
    .limit(MAX_CANDIDATES)
    .lean<RestaurantDoc[]>();
  return docs.map(toRestaurantDTO);
}

/**
 * Pencarian "dekat saya", terurut jarak. Tidak di-cache: koordinat setiap pengguna berbeda
 * dan akan menumpuk di cache. Butuh index 2dsphere (sudah ada).
 */
export async function listNearby(params: ListParams): Promise<RestaurantDTO[]> {
  const near = params.near;
  if (!near) return [];
  await connectDB();
  const pipeline: PipelineStage[] = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [near.lng, near.lat] },
        distanceField: "distance",
        maxDistance: near.radiusKm * 1000,
        spherical: true,
        query: buildFilter(params, { withRating: false }),
      },
    },
  ];
  if (params.minRating) {
    pipeline.push({
      $match: {
        ratingCount: { $gt: 0 },
        $expr: {
          $gte: [
            { $divide: ["$ratingSum", { $max: ["$ratingCount", 1] }] },
            params.minRating,
          ],
        },
      },
    });
  }
  pipeline.push({ $limit: MAX_CANDIDATES });
  const docs = await Restaurant.aggregate<RestaurantDoc & { distance: number }>(pipeline);
  return docs.map(toRestaurantDTO);
}

export function paginateList<T>(items: T[], page: number): Paginated<T> {
  const safePage = Math.max(1, Math.floor(page));
  return paginate(
    items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    items.length,
    safePage,
  );
}

export async function getFeaturedRestaurants(limit = 6): Promise<RestaurantDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("restaurants");

  await connectDB();
  const docs = await Restaurant.find({})
    .sort({ ratingCount: -1, name: 1 })
    .limit(limit)
    .lean<RestaurantDoc[]>();
  return docs.map(toRestaurantDTO);
}

/** Real counts for the landing page (no invented numbers). */
export async function getSiteStats(): Promise<{
  restaurants: number;
  cities: number;
  reviews: number;
}> {
  "use cache";
  cacheLife("hours");
  cacheTag("restaurants");

  await connectDB();
  const [restaurants, cities, reviews] = await Promise.all([
    Restaurant.estimatedDocumentCount(),
    Restaurant.distinct("city"),
    Review.estimatedDocumentCount(),
  ]);
  return { restaurants, cities: (cities as string[]).filter(Boolean).length, reviews };
}

export async function getRestaurantBySlug(slug: string): Promise<RestaurantDTO | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("restaurants", `restaurant:${slug}`);

  await connectDB();
  const doc = await Restaurant.findOne({ slug }).lean<RestaurantDoc>();
  return doc ? toRestaurantDTO(doc) : null;
}

/** Untuk koleksi yang dibagikan lewat tautan. Urutan mengikuti `slugs`. */
export async function getRestaurantsBySlugs(slugs: string[]): Promise<RestaurantDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("restaurants");

  const unique = [...new Set(slugs)].slice(0, 30);
  if (unique.length === 0) return [];
  await connectDB();
  const docs = await Restaurant.find({ slug: { $in: unique } }).lean<RestaurantDoc[]>();
  const bySlug = new Map(docs.map((d) => [d.slug, toRestaurantDTO(d)]));
  return unique.flatMap((s) => bySlug.get(s) ?? []);
}

export async function getFilterOptions(): Promise<{
  cities: string[];
  categories: string[];
}> {
  "use cache";
  cacheLife("days");
  cacheTag("restaurants");

  await connectDB();
  const [cities, categories] = await Promise.all([
    Restaurant.distinct("city"),
    Restaurant.distinct("categories"),
  ]);
  const clean = (values: unknown[]) =>
    (values as string[]).filter(Boolean).sort((a, b) => a.localeCompare(b, "id"));
  return { cities: clean(cities), categories: clean(categories) };
}

export async function getAllRestaurantSlugs(): Promise<
  { slug: string; updatedAt: string }[]
> {
  "use cache";
  cacheLife("hours");
  cacheTag("restaurants");

  await connectDB();
  const docs = await Restaurant.find({}, { slug: 1, updatedAt: 1 }).lean<
    Pick<RestaurantDoc, "slug" | "updatedAt">[]
  >();
  return docs.map((d) => ({
    slug: d.slug,
    updatedAt: new Date(d.updatedAt).toISOString(),
  }));
}
