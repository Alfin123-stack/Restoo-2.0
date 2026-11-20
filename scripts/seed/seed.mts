/**
 * Memasukkan data seed ke MongoDB secara idempoten (aman dijalankan berulang).
 *
 *   npm run seed            # semua file data/seed/raw-*.json
 *   npm run seed -- --file data/seed/raw-kota.json
 *   npm run seed:demo       # data contoh fiktif (data/seed/demo.json)
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { Restaurant, type RestaurantDoc } from "../../src/lib/db/models/restaurant.ts";
import { connectForScript } from "./db.mts";
import {
  assignSlugs,
  normalizeGeoapifyFeature,
  type GeoapifyFeature,
  type Override,
  type SeedRestaurant,
} from "./normalize.mts";

const SEED_DIR = path.join("data", "seed");

/** Photo URLs must be absolute https links of sane length; anything else is dropped. */
function cleanPicture(url: string | undefined): string | undefined {
  if (!url || url.length > 500) return undefined;
  try {
    return new URL(url).protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}
const { values } = parseArgs({
  options: { file: { type: "string" }, demo: { type: "boolean", default: false } },
});

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf-8")) as T;
}

async function loadItems(): Promise<{ items: SeedRestaurant[]; provider: string }> {
  if (values.demo) {
    return {
      items: await readJson<SeedRestaurant[]>(path.join(SEED_DIR, "demo.json")),
      provider: "demo",
    };
  }
  const files = values.file
    ? [values.file]
    : (await readdir(SEED_DIR))
        .filter((f) => /^raw-.*\.json$/.test(f))
        .map((f) => path.join(SEED_DIR, f));
  if (files.length === 0) {
    throw new Error(
      "No data found. Run `npm run seed:fetch` first, or use `npm run seed:demo`.",
    );
  }
  const items: SeedRestaurant[] = [];
  for (const file of files) {
    const raw = await readJson<{ features: GeoapifyFeature[] }>(file);
    for (const feature of raw.features) {
      const item = normalizeGeoapifyFeature(feature);
      if (item) items.push(item);
    }
    console.log(`Read ${file}`);
  }
  return { items, provider: "geoapify" };
}

async function loadOverrides(): Promise<Record<string, Override>> {
  try {
    return await readJson<Record<string, Override>>(
      path.join(SEED_DIR, "overrides.json"),
    );
  } catch {
    return {};
  }
}

const mongoose = await connectForScript();
const { items, provider } = await loadItems();
const overrides = await loadOverrides();

const existingDocs = await Restaurant.find({}, { slug: 1, "source.placeId": 1 }).lean<
  Pick<RestaurantDoc, "slug" | "source">[]
>();
const taken = new Set(existingDocs.map((d) => d.slug));
const existing = new Map(existingDocs.map((d) => [d.source.placeId, d.slug]));

const prepared = assignSlugs(items, existing, taken);
const now = new Date();

const operations = prepared.map(({ item, slug }) => {
  const override = overrides[item.placeId] ?? {};
  const data = { ...item, ...override };
  const $set: Record<string, unknown> = {
    name: data.name,
    address: data.address,
    city: data.city,
    categories: data.categories,
    "source.fetchedAt": now,
  };
  const optional: Record<string, unknown> = {
    openingHours: data.openingHours,
    phone: data.phone,
    website: data.website,
    description: data.description,
    pictureUrl: cleanPicture(data.pictureUrl),
    pictureUrls: data.pictureUrls?.map(cleanPicture).filter(Boolean),
    menus: data.menus,
    priceLevel: data.priceLevel,
    tags: data.tags,
  };
  for (const [key, value] of Object.entries(optional))
    if (value !== undefined) $set[key] = value;
  if (data.coordinates) $set.location = { type: "Point", coordinates: data.coordinates };

  return {
    updateOne: {
      filter: { "source.placeId": item.placeId },
      update: {
        $set,
        $setOnInsert: { slug, ratingSum: 0, ratingCount: 0, "source.provider": provider },
      },
      upsert: true,
    },
  };
});

if (operations.length === 0) {
  console.log("Nothing to seed.");
} else {
  const result = await Restaurant.bulkWrite(operations, { ordered: false });
  console.log(
    `Seed complete: ${result.upsertedCount} new, ${result.modifiedCount} updated (out of ${operations.length}).`,
  );
}
await mongoose.disconnect();
