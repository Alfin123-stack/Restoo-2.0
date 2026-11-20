import { PixelStar, PixelStars } from "@/components/pixel/pixel-art";
import { formatRating } from "@/lib/format";

export function RatingBadge({
  rating,
  count,
}: {
  rating: number | null;
  count?: number;
}) {
  if (rating === null) {
    return <span className="text-terong-500 text-sm">No ratings yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-bold">
      <PixelStar size={2} />
      <span>{formatRating(rating)}</span>
      {typeof count === "number" ? (
        <span className="text-terong-500 font-normal">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      ) : null}
    </span>
  );
}

export function RatingStars({ value }: { value: number }) {
  return <PixelStars value={value} />;
}
