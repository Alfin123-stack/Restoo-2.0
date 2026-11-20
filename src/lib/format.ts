export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export function formatRating(rating: number | null): string {
  return rating === null ? "No rating yet" : rating.toFixed(1);
}

export function toTitleCase(value: string): string {
  return value.replace(/[_.-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
