/**
 * Menarik data tempat makan dari Geoapify Places dan menyimpannya sebagai snapshot JSON.
 *
 *   npm run seed:fetch -- --city "Nama Kota" [--limit 500] [--categories catering.restaurant,catering.cafe]
 *
 * Syarat penggunaan: tampilkan atribusi OpenStreetMap + Geoapify (sudah ada di footer).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { slugify } from "../../src/lib/slug.ts";

const { values } = parseArgs({
  options: {
    city: { type: "string" },
    limit: { type: "string", default: "500" },
    categories: {
      type: "string",
      default: "catering.restaurant,catering.cafe,catering.fast_food",
    },
  },
});

const apiKey = process.env.GEOAPIFY_API_KEY;
if (!apiKey) throw new Error("GEOAPIFY_API_KEY is not set in .env.local");
if (!values.city) throw new Error('Use --city "City Name"');

const cap = Math.min(Number(values.limit) || 500, 2000);
const PAGE = 100;

async function getJson(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok)
    throw new Error(`Geoapify ${response.status}: ${await response.text()}`);
  return response.json();
}

const geocode = await getJson(
  `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(values.city)}&limit=1&format=json&apiKey=${apiKey}`,
);
const place = geocode.results?.[0];
if (!place?.place_id) throw new Error(`City "${values.city}" not found`);
console.log(`Area: ${place.formatted}`);

const features: unknown[] = [];
for (let offset = 0; offset < cap; offset += PAGE) {
  const page = await getJson(
    `https://api.geoapify.com/v2/places?categories=${values.categories}&filter=place:${place.place_id}&limit=${PAGE}&offset=${offset}&apiKey=${apiKey}`,
  );
  const batch: unknown[] = page.features ?? [];
  features.push(...batch);
  console.log(`  fetched ${features.length}`);
  if (batch.length < PAGE) break;
}

const out = path.join("data", "seed", `raw-${slugify(values.city)}.json`);
await mkdir(path.dirname(out), { recursive: true });
await writeFile(
  out,
  JSON.stringify(
    {
      provider: "geoapify",
      fetchedAt: new Date().toISOString(),
      query: values.city,
      features,
    },
    null,
    2,
  ),
);
console.log(`Saved: ${out} (${features.length} places)`);
