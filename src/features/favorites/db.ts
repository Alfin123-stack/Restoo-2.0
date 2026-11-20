import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { FavoriteRestaurant } from "@/types";

export const DATABASE_NAME = "restoo-favorites";
export const DATABASE_VERSION = 1;
export const STORE_NAME = "favorites";

interface FavoritesDB extends DBSchema {
  [STORE_NAME]: { key: string; value: FavoriteRestaurant };
}

let dbPromise: Promise<IDBPDatabase<FavoritesDB>> | undefined;

function getDB() {
  dbPromise ??= openDB<FavoritesDB>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      database.createObjectStore(STORE_NAME, { keyPath: "slug" });
    },
  });
  return dbPromise;
}

/** Only used in tests so each test starts from a fresh database. */
export function __resetFavoritesDB() {
  dbPromise = undefined;
}

export const favoritesDB = {
  async get(slug: string) {
    if (!slug) return undefined;
    return (await getDB()).get(STORE_NAME, slug);
  },
  async getAll() {
    const all = await (await getDB()).getAll(STORE_NAME);
    return all.sort((a, b) => b.savedAt - a.savedAt);
  },
  async put(item: FavoriteRestaurant) {
    if (!item.slug) return;
    await (await getDB()).put(STORE_NAME, item);
  },
  async delete(slug: string) {
    await (await getDB()).delete(STORE_NAME, slug);
  },
  async search(query: string) {
    const normalize = (v: string) => v.toLowerCase().replace(/\s/g, "");
    const needle = normalize(query);
    const all = await this.getAll();
    if (!needle) return all;
    return all.filter(
      (r) => normalize(r.name).includes(needle) || normalize(r.city).includes(needle),
    );
  },
};
