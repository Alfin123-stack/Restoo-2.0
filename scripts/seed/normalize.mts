import { slugify, uniqueSlug } from "../../src/lib/slug.ts";

export type SeedRestaurant = {
  placeId: string;
  name: string;
  address: string;
  city: string;
  categories: string[];
  coordinates?: [number, number]; // [lng, lat]
  openingHours?: string;
  phone?: string;
  website?: string;
  description?: string;
  pictureUrl?: string;
  pictureUrls?: string[];
  menus?: { foods: string[]; drinks: string[] };
  priceLevel?: 1 | 2 | 3;
  tags?: string[];
};

export type Override = Partial<
  Pick<
    SeedRestaurant,
    | "name"
    | "description"
    | "pictureUrl"
    | "pictureUrls"
    | "menus"
    | "priceLevel"
    | "tags"
    | "openingHours"
  >
>;

type GeoapifyProps = Record<string, unknown> & {
  datasource?: { raw?: Record<string, unknown> };
  contact?: Record<string, unknown>;
};

export type GeoapifyFeature = {
  properties?: GeoapifyProps;
  geometry?: { coordinates?: number[] };
};

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

/** Mengubah satu fitur GeoJSON Geoapify menjadi data seed. Mengembalikan null bila tidak layak. */
export function normalizeGeoapifyFeature(
  feature: GeoapifyFeature,
): SeedRestaurant | null {
  const props = feature.properties;
  if (!props) return null;

  const placeId = str(props.place_id);
  const name = str(props.name);
  if (!placeId || !name) return null;

  const raw = props.datasource?.raw ?? {};
  const contact = props.contact ?? {};
  const [lngRaw, latRaw] = feature.geometry?.coordinates ?? [props.lon, props.lat];
  const lng = Number(lngRaw);
  const lat = Number(latRaw);
  const hasCoords =
    Number.isFinite(lng) && Number.isFinite(lat) && (lng !== 0 || lat !== 0);

  const categories = Array.isArray(props.categories)
    ? (props.categories as unknown[]).filter(
        (c): c is string => typeof c === "string" && c.startsWith("catering."),
      )
    : [];

  const street = [str(props.street), str(props.housenumber)].filter(Boolean).join(" ");
  const address =
    street || str(props.address_line2) || str(props.suburb) || str(props.formatted) || "";

  return {
    placeId,
    name,
    address,
    city: str(props.city) ?? str(props.county) ?? str(props.state_district) ?? "",
    categories,
    coordinates: hasCoords ? [lng, lat] : undefined,
    openingHours: str(props.opening_hours) ?? str(raw.opening_hours),
    phone: str(contact.phone) ?? str(raw.phone),
    website: str(props.website) ?? str(contact.website) ?? str(raw.website),
  };
}

/** Membuang duplikat placeId dan memberi slug unik, tanpa menimpa slug yang sudah ada di database. */
export function assignSlugs(
  items: SeedRestaurant[],
  existing: Map<string, string>, // placeId -> slug yang sudah tersimpan
  taken: Set<string>,
): { item: SeedRestaurant; slug: string }[] {
  const seen = new Set<string>();
  const result: { item: SeedRestaurant; slug: string }[] = [];
  for (const item of items) {
    if (seen.has(item.placeId)) continue;
    seen.add(item.placeId);
    const kept = existing.get(item.placeId);
    const slug =
      kept ??
      uniqueSlug(slugify([item.name, item.city].filter(Boolean).join(" ")), taken);
    result.push({ item, slug });
  }
  return result;
}
