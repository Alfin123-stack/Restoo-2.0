import { collectionsDB } from "./db";
import type { Collection, FavoriteRestaurant } from "@/types";

type Listener = () => void;
type Item = Omit<FavoriteRestaurant, "savedAt">;

const listeners = new Set<Listener>();
// The server snapshot must be the same reference on every call (useSyncExternalStore rule).
const EMPTY: Collection[] = [];
let snapshot: Collection[] = [];
let loaded = false;
let loading: Promise<void> | undefined;
let channel: BroadcastChannel | undefined;

export const MAX_COLLECTIONS = 20;
export const MAX_ITEMS = 100;

function emit() {
  for (const l of listeners) l();
}

async function refresh() {
  snapshot = await collectionsDB.getAll();
  loaded = true;
  emit();
}

function ensureChannel() {
  if (channel || typeof BroadcastChannel === "undefined") return;
  channel = new BroadcastChannel("restoo-collections");
  channel.onmessage = () => void refresh();
}

async function commit(collection: Collection) {
  await collectionsDB.put(collection);
  await refresh();
  channel?.postMessage("changed");
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const collectionsStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    ensureChannel();
    if (!loaded) loading ??= refresh().finally(() => (loading = undefined));
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => snapshot,
  getServerSnapshot: (): Collection[] => EMPTY,
  isLoaded: () => loaded,

  /** Returns the new collection, or null if the limit is reached or the name is empty. */
  async create(name: string, items: Item[] = []): Promise<Collection | null> {
    const clean = name.trim().slice(0, 40);
    if (!clean || snapshot.length >= MAX_COLLECTIONS) return null;
    const collection: Collection = {
      id: newId(),
      name: clean,
      items: items.slice(0, MAX_ITEMS),
      createdAt: Date.now(),
    };
    await commit(collection);
    return collection;
  },
  async rename(id: string, name: string) {
    const current = snapshot.find((c) => c.id === id);
    const clean = name.trim().slice(0, 40);
    if (current && clean) await commit({ ...current, name: clean });
  },
  async remove(id: string) {
    await collectionsDB.delete(id);
    await refresh();
    channel?.postMessage("changed");
  },
  async addItem(id: string, item: Item) {
    const current = snapshot.find((c) => c.id === id);
    if (!current || current.items.some((i) => i.slug === item.slug)) return;
    if (current.items.length >= MAX_ITEMS) return;
    await commit({ ...current, items: [...current.items, item] });
  },
  async removeItem(id: string, slug: string) {
    const current = snapshot.find((c) => c.id === id);
    if (current)
      await commit({ ...current, items: current.items.filter((i) => i.slug !== slug) });
  },
};
