"use server";

import { connectDB } from "@/lib/db/connect";
import { Restaurant, type RestaurantDoc } from "@/lib/db/models/restaurant";
import { toRestaurantDTO } from "@/lib/db/serialize";
import { interpretRequest } from "@/lib/ai/interpret";
import { isOpenNow } from "@/lib/opening-hours";
import { getFilterOptions } from "@/lib/repositories/restaurants";
import { TAG_LABEL } from "@/lib/constants";
import type { RestaurantDTO } from "@/types";

export type GachaResult =
  | { ok: true; restaurant: RestaurantDTO; reason: string }
  | { ok: false; message: string };

const clean = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : undefined;

/** One short sentence explaining the pick, built only from real data (never invented). */
function explain(r: RestaurantDoc, open: boolean, moodNote?: string): string {
  const bits: string[] = [];
  if (moodNote) bits.push(moodNote);
  if (open) bits.push("open right now");
  if (r.ratingCount > 0)
    bits.push(
      `${(r.ratingSum / r.ratingCount).toFixed(1)}★ from ${r.ratingCount} reviews`,
    );
  const tag = r.tags?.find((t) => TAG_LABEL[t]);
  if (tag) bits.push(TAG_LABEL[tag]!.toLowerCase());
  return bits.length ? bits.join(" · ") : "a fresh pick for you";
}

/**
 * "What should I eat today?": picks one random restaurant, optionally limited by city/type/open now,
 * steered by a free-text mood ("rainy, want something warm"), and skipping places already shown.
 */
export async function spinGacha(input: {
  city?: string;
  category?: string;
  openOnly?: boolean;
  mood?: string;
  exclude?: string[];
}): Promise<GachaResult> {
  try {
    await connectDB();
    const match: Record<string, unknown> = {};
    let city = clean(input?.city);
    let category = clean(input?.category);
    let moodNote: string | undefined;
    let openOnly = input?.openOnly === true;

    const mood = clean(input?.mood);
    if (mood) {
      const vocab = await getFilterOptions().catch(() => ({
        cities: [],
        categories: [],
      }));
      const hint = await interpretRequest(mood, vocab);
      city ??= hint.city;
      category ??= hint.category;
      if (hint.tag) match.tags = hint.tag;
      if (hint.maxPrice)
        match.priceLevel = {
          $in: ([1, 2, 3] as const).filter((p) => p <= hint.maxPrice!),
        };
      if (hint.openNow) openOnly = true;
      if (hint.q && !hint.tag && !category) {
        const rx = new RegExp(hint.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        match.$or = [
          { name: rx },
          { categories: rx },
          { "menus.foods": rx },
          { "menus.drinks": rx },
        ];
      }
      moodNote = hint.summary ? `fits “${hint.summary}”` : undefined;
    }
    if (city) match.city = city;
    if (category) match.categories = category;

    const exclude = (Array.isArray(input?.exclude) ? input.exclude : [])
      .filter((s): s is string => typeof s === "string")
      .slice(0, 50);
    if (exclude.length) match.slug = { $nin: exclude };

    // Sample extra candidates so "open now" can be filtered in the app.
    const docs = await Restaurant.aggregate<RestaurantDoc>([
      { $match: match },
      { $sample: { size: openOnly ? 40 : 1 } },
    ]);
    const pool = openOnly ? docs.filter((d) => isOpenNow(d.openingHours)) : docs;
    const pick = pool[0];
    if (!pick) {
      return {
        ok: false,
        message: exclude.length
          ? "That's every place that fits. Clear your filters or start over to see them again."
          : openOnly
            ? "No places are listed as open right now. Try turning off the “open now” filter."
            : "No restaurants match your picks yet.",
      };
    }
    return {
      ok: true,
      restaurant: toRestaurantDTO(pick),
      reason: explain(pick, isOpenNow(pick.openingHours), moodNote),
    };
  } catch (error) {
    console.error("Gacha failed", error);
    return { ok: false, message: "The gacha machine is jammed. Try again in a moment." };
  }
}
