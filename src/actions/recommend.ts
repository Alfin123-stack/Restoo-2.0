"use server";

import { listAllMatching, getRestaurantsBySlugs } from "@/lib/repositories/restaurants";
import { TAG_LABEL } from "@/lib/constants";
import type { RestaurantDTO } from "@/types";

export type ForYou = { reason: string; restaurants: RestaurantDTO[] };

const top = (counts: Map<string, number>) =>
  [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

/**
 * "For you": looks at what the visitor saved (slugs come from their own device, nothing is stored)
 * and suggests other places that share the most common feature or type.
 */
export async function recommendFromFavorites(slugs: string[]): Promise<ForYou | null> {
  const saved = (Array.isArray(slugs) ? slugs : [])
    .filter((s): s is string => typeof s === "string")
    .slice(0, 30);
  if (saved.length === 0) return null;
  try {
    const mine = await getRestaurantsBySlugs(saved);
    if (mine.length === 0) return null;

    const tags = new Map<string, number>();
    const cats = new Map<string, number>();
    for (const r of mine) {
      for (const t of r.tags) tags.set(t, (tags.get(t) ?? 0) + 1);
      for (const c of r.categories) cats.set(c, (cats.get(c) ?? 0) + 1);
    }
    const tag = top(tags);
    const category = top(cats);
    const exclude = new Set(saved);

    const pick = async (params: { tag?: string; category?: string }) =>
      (await listAllMatching(params)).filter((r) => !exclude.has(r.slug)).slice(0, 6);

    if (tag) {
      const items = await pick({ tag });
      if (items.length)
        return {
          reason: `Because you saved ${TAG_LABEL[tag]?.toLowerCase() ?? tag} places`,
          restaurants: items,
        };
    }
    if (category) {
      const items = await pick({ category });
      if (items.length)
        return {
          reason: `Because you saved ${category.split(".").pop()!.replace(/_/g, " ")} spots`,
          restaurants: items,
        };
    }
    return null;
  } catch (error) {
    console.error("recommendFromFavorites failed", error);
    return null;
  }
}
