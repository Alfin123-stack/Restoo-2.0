import type { ListParams } from "@/lib/repositories/restaurants";

type Raw = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export type RestaurantQuery = ListParams & {
  /** Hanya yang sedang buka (dihitung per request, tidak di-cache). */
  openNow: boolean;
  view: "list" | "map";
  sort: SortKey;
  /** Short text from Ask Meong describing the filters it applied (display only). */
  ask?: string;
};

export const SORTS = [
  { key: "popular", label: "Most reviewed" },
  { key: "rating", label: "Highest rated" },
  { key: "price", label: "Lowest price" },
  { key: "name", label: "Name A–Z" },
  { key: "nearest", label: "Nearest" },
] as const;
export type SortKey = (typeof SORTS)[number]["key"];

/** Membaca & membersihkan query string halaman jelajah. Semua nilai opsional dan aman. */
export function parseRestaurantQuery(sp: Raw): RestaurantQuery {
  const num = (v: string | undefined, min: number, max: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
  };

  let near: ListParams["near"];
  const nearRaw = first(sp.dekat);
  if (nearRaw) {
    const [lat, lng] = nearRaw.split(",").map(Number);
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat!) <= 90 &&
      Math.abs(lng!) <= 180
    ) {
      near = { lat: lat!, lng: lng!, radiusKm: num(first(sp.radius), 1, 50) ?? 5 };
    }
  }

  return {
    q: first(sp.q)?.trim().slice(0, 80) || undefined,
    city: first(sp.city) || undefined,
    category: first(sp.category) || undefined,
    tag: first(sp.tag) || undefined,
    minRating: num(first(sp.rating), 1, 5),
    maxPrice: num(first(sp.harga), 1, 3),
    near,
    openNow: first(sp.buka) === "1",
    view: first(sp.view) === "map" ? "map" : "list",
    sort: SORTS.some((o) => o.key === first(sp.sort))
      ? (first(sp.sort) as SortKey)
      : "popular",
    ask: first(sp.ask)?.trim().slice(0, 140) || undefined,
    page: Math.max(1, Number.parseInt(first(sp.page) ?? "1", 10) || 1),
  };
}

/** Parameter yang dipertahankan antar halaman (untuk pagination dan toggle tampilan). */
export function queryToParams(
  query: RestaurantQuery,
): Record<string, string | undefined> {
  return {
    q: query.q,
    city: query.city,
    category: query.category,
    tag: query.tag,
    rating: query.minRating ? String(query.minRating) : undefined,
    harga: query.maxPrice ? String(query.maxPrice) : undefined,
    dekat: query.near ? `${query.near.lat},${query.near.lng}` : undefined,
    radius: query.near ? String(query.near.radiusKm) : undefined,
    buka: query.openNow ? "1" : undefined,
    view: query.view === "map" ? "map" : undefined,
    sort: query.sort !== "popular" ? query.sort : undefined,
    ask: query.ask,
  };
}
