import { favoritesDB } from "./db";
import type { FavoriteRestaurant } from "@/types";

type Listener = () => void;

const listeners = new Set<Listener>();
// The server snapshot must be the same reference on every call (useSyncExternalStore rule).
const EMPTY: FavoriteRestaurant[] = [];
let snapshot: FavoriteRestaurant[] = [];
let loaded = false;
let loading: Promise<void> | undefined;
let channel: BroadcastChannel | undefined;
// Bumped whenever the store is reset (tests) so stale late reads are ignored.
let generation = 0;

function emit() {
  for (const l of listeners) l();
}

async function refresh() {
  const current = generation;
  const next = await favoritesDB.getAll();
  if (current !== generation) return;
  snapshot = next;
  loaded = true;
  emit();
}

function ensureChannel() {
  if (channel || typeof BroadcastChannel === "undefined") return;
  channel = new BroadcastChannel("restoo-favorites");
  // Sync across tabs.
  channel.onmessage = () => void refresh();
}

export const favoritesStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    ensureChannel();
    if (!loaded) loading ??= refresh().finally(() => (loading = undefined));
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => snapshot,
  getServerSnapshot: (): FavoriteRestaurant[] => EMPTY,
  isLoaded: () => loaded,

  async add(item: Omit<FavoriteRestaurant, "savedAt">) {
    await favoritesDB.put({ ...item, savedAt: Date.now() });
    await refresh();
    channel?.postMessage("changed");
  },
  async remove(slug: string) {
    await favoritesDB.delete(slug);
    await refresh();
    channel?.postMessage("changed");
  },
  /** Tests only. */
  __reset() {
    generation++;
    snapshot = [];
    loaded = false;
    loading = undefined;
    listeners.clear();
  },
};
