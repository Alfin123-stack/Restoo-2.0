"use client";

import { useEffect, useState } from "react";
import { recommendFromFavorites, type ForYou as ForYouData } from "@/actions/recommend";
import { useFavoritesStatus } from "@/features/favorites/use-favorites";
import { RestaurantGrid } from "./restaurant-card";

/** "For you": suggestions based on the places saved on this device. Nothing about the visitor is stored. */
export function ForYou() {
  const { favorites, loaded } = useFavoritesStatus();
  const [data, setData] = useState<ForYouData | null>(null);
  const key = favorites
    .map((f) => f.slug)
    .sort()
    .join(",");

  useEffect(() => {
    if (!loaded || !key) return;
    let cancelled = false;
    recommendFromFavorites(key.split(",")).then((r) => {
      if (!cancelled) setData(r);
    });
    return () => {
      cancelled = true;
    };
  }, [loaded, key]);

  if (!data || data.restaurants.length === 0) return null;
  return (
    <section aria-labelledby="for-you" className="mt-14">
      <h2 id="for-you" className="text-3xl">
        For you
      </h2>
      <p className="text-terong-700 mt-2">{data.reason}.</p>
      <div className="mt-6">
        <RestaurantGrid restaurants={data.restaurants} />
      </div>
    </section>
  );
}
