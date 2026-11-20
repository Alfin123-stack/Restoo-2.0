import { collectionsStore } from "@/features/collections/store";
import { favoritesStore } from "@/features/favorites/store";
import type { Collection, FavoriteRestaurant } from "@/types";

type Item = Omit<FavoriteRestaurant, "savedAt">;
export type Backup = {
  app: "restoo";
  version: 1;
  exportedAt: string;
  favorites: FavoriteRestaurant[];
  collections: Collection[];
};

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.slice(0, max) : "");

function cleanItem(raw: unknown): Item | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const slug = str(r.slug, 120);
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const pic =
    typeof r.pictureUrl === "string" && /^https?:\/\//.test(r.pictureUrl)
      ? r.pictureUrl.slice(0, 500)
      : null;
  return {
    slug,
    name: str(r.name, 120) || slug,
    city: str(r.city, 80),
    pictureUrl: pic,
    rating:
      typeof r.rating === "number" && r.rating >= 0 && r.rating <= 5 ? r.rating : null,
  };
}

/** Downloads favorites and collections as a JSON file (they only live on this device otherwise). */
export function exportBackup(): void {
  const backup: Backup = {
    app: "restoo",
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites: favoritesStore.getSnapshot(),
    collections: collectionsStore.getSnapshot(),
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `restoo-backup-${backup.exportedAt.slice(0, 10)}.json`;
  // In the DOM and revoked later: some browsers cancel the download if the URL dies right away.
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Merges a backup file into this device. Unknown or malformed entries are skipped, never trusted. */
export async function importBackup(
  file: File,
): Promise<{ favorites: number; collections: number }> {
  if (file.size > 1_000_000) throw new Error("File too large");
  const data = JSON.parse(await file.text()) as Partial<Backup>;
  if (data?.app !== "restoo" || data.version !== 1)
    throw new Error("Not a Restoo backup");

  const have = new Set(favoritesStore.getSnapshot().map((f) => f.slug));
  let favorites = 0;
  for (const raw of (Array.isArray(data.favorites) ? data.favorites : []).slice(0, 200)) {
    const item = cleanItem(raw);
    if (item && !have.has(item.slug)) {
      await favoritesStore.add(item);
      have.add(item.slug);
      favorites++;
    }
  }
  const names = new Set(collectionsStore.getSnapshot().map((c) => c.name));
  let collections = 0;
  for (const raw of (Array.isArray(data.collections) ? data.collections : []).slice(
    0,
    20,
  )) {
    const c = raw as Partial<Collection>;
    const name = str(c?.name, 40).trim();
    if (!name || names.has(name)) continue;
    const items = (Array.isArray(c.items) ? c.items : [])
      .map(cleanItem)
      .filter((i): i is Item => i !== null);
    if (await collectionsStore.create(name, items)) {
      names.add(name);
      collections++;
    }
  }
  return { favorites, collections };
}
