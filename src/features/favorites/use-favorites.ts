"use client";

import { sfx } from "@/lib/audio/sound";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { favoritesStore } from "./store";
import type { FavoriteRestaurant } from "@/types";

export function useFavorites() {
  const favorites = useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.getSnapshot,
    favoritesStore.getServerSnapshot,
  );
  return favorites;
}

export function useFavorite(item: Omit<FavoriteRestaurant, "savedAt">) {
  const favorites = useFavorites();
  const isFavorite = useMemo(
    () => favorites.some((f) => f.slug === item.slug),
    [favorites, item.slug],
  );

  const toggle = useCallback(async () => {
    if (isFavorite) await favoritesStore.remove(item.slug);
    else {
      await favoritesStore.add(item);
      sfx("save");
    }
  }, [isFavorite, item]);

  return { isFavorite, toggle };
}

const subscribeLoaded = favoritesStore.subscribe;

/** Includes an "already read from IndexedDB" flag so the UI doesn't flash an empty state. */
export function useFavoritesStatus() {
  const favorites = useFavorites();
  const loaded = useSyncExternalStore(
    subscribeLoaded,
    favoritesStore.isLoaded,
    () => false,
  );
  return { favorites, loaded };
}
