"use client";

import { useState } from "react";
import { PixelHeart } from "@/components/pixel/pixel-art";
import { Sprite } from "@/components/pixel/sprite";
import { useFavorite } from "@/features/favorites/use-favorites";
import { cn } from "@/lib/utils";
import type { FavoriteRestaurant } from "@/types";

export function LikeButton({
  restaurant,
}: {
  restaurant: Omit<FavoriteRestaurant, "savedAt">;
}) {
  const { isFavorite, toggle } = useFavorite(restaurant);
  const [burst, setBurst] = useState(0);

  const onClick = async () => {
    const wasFavorite = isFavorite;
    await toggle();
    if (!wasFavorite) {
      const id = Date.now();
      setBurst(id);
      setTimeout(() => setBurst((current) => (current === id ? 0 : current)), 700);
    }
  };

  return (
    <button
      type="button"
      id="likeButton"
      onClick={() => void onClick()}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
      className={cn(
        "px-box px-press font-label relative inline-flex min-h-12 items-center gap-3 px-5 text-[13px] tracking-wider uppercase",
        isFavorite
          ? "text-terong-900 [--px-bg:var(--color-cabai-600)]"
          : "[--px-bg:var(--color-kartu)]",
      )}
    >
      <span className="relative inline-flex">
        <PixelHeart filled={isFavorite} size={3} />
        {burst ? (
          <span className="pointer-events-none absolute -top-5 -left-5">
            <Sprite key={burst} name="heart-burst" scale={4} fps={8} loop={false} />
          </span>
        ) : null}
      </span>
      {isFavorite ? "Saved" : "Save"}
    </button>
  );
}
