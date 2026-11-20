"use client";

import { useSyncExternalStore } from "react";
import { collectionsStore } from "./store";

export function useCollections() {
  const collections = useSyncExternalStore(
    collectionsStore.subscribe,
    collectionsStore.getSnapshot,
    collectionsStore.getServerSnapshot,
  );
  const loaded = useSyncExternalStore(
    collectionsStore.subscribe,
    collectionsStore.isLoaded,
    () => false,
  );
  return { collections, loaded };
}
