export type RestaurantDTO = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  categories: string[];
  coordinates: [number, number] | null; // [lng, lat]
  openingHours: string | null;
  phone: string | null;
  website: string | null;
  pictureUrl: string | null;
  /** Cover first, then extra photos; empty when there are none. */
  pictureUrls: string[];
  menus: { foods: string[]; drinks: string[] };
  rating: number | null;
  ratingCount: number;
  priceLevel: 1 | 2 | 3 | null;
  tags: string[];
  /** Hanya terisi pada pencarian "dekat saya". */
  distanceKm?: number;
};

export type ReviewDTO = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string; // ISO
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

/** Ringkasan yang disimpan di IndexedDB saat restoran difavoritkan. */
export type FavoriteRestaurant = {
  slug: string;
  name: string;
  city: string;
  pictureUrl: string | null;
  rating: number | null;
  savedAt: number;
};

/** Koleksi bernama yang disimpan di IndexedDB (tas bekal). */
export type Collection = {
  id: string;
  name: string;
  items: Omit<FavoriteRestaurant, "savedAt">[];
  createdAt: number;
};
