import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Collection } from "@/types";

export const COLLECTIONS_DB = "restoo-collections";
export const COLLECTIONS_STORE = "collections";

interface CollectionsDB extends DBSchema {
  [COLLECTIONS_STORE]: { key: string; value: Collection };
}

let dbPromise: Promise<IDBPDatabase<CollectionsDB>> | undefined;

function getDB() {
  dbPromise ??= openDB<CollectionsDB>(COLLECTIONS_DB, 1, {
    upgrade(database) {
      database.createObjectStore(COLLECTIONS_STORE, { keyPath: "id" });
    },
  });
  return dbPromise;
}

export const collectionsDB = {
  async getAll() {
    const all = await (await getDB()).getAll(COLLECTIONS_STORE);
    return all.sort((a, b) => a.createdAt - b.createdAt);
  },
  async put(collection: Collection) {
    await (await getDB()).put(COLLECTIONS_STORE, collection);
  },
  async get(id: string) {
    return (await getDB()).get(COLLECTIONS_STORE, id);
  },
  async delete(id: string) {
    await (await getDB()).delete(COLLECTIONS_STORE, id);
  },
};
