/** Restaurant feature tags that can be filtered. Keys are stored in the database. */
export const TAGS = [
  { key: "halal", label: "Halal" },
  { key: "vegetarian", label: "Vegetarian" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "outdoor", label: "Outdoor seating" },
  { key: "delivery", label: "Delivery" },
  { key: "reservasi", label: "Reservations" },
] as const;

export const TAG_LABEL: Record<string, string> = Object.fromEntries(
  TAGS.map((t) => [t.key, t.label]),
);

export const PRICE_LABEL: Record<number, string> = {
  1: "Cheap",
  2: "Moderate",
  3: "Pricey",
};

/** Default map center (Jambi) when a restaurant has no coordinates. */
export const DEFAULT_CENTER: [number, number] = [103.6131, -1.6101];
