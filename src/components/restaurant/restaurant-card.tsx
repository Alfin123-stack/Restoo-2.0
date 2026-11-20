import Link from "next/link";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { Badge } from "@/components/ui/badge";
import { OpenBadge } from "./open-badge";
import { PriceLevel } from "./price-level";
import { RatingBadge } from "./rating";
import { RestaurantImage } from "./restaurant-image";
import { TAG_LABEL } from "@/lib/constants";
import { toTitleCase } from "@/lib/format";
import type { RestaurantDTO } from "@/types";

export function RestaurantCard({ restaurant }: { restaurant: RestaurantDTO }) {
  const {
    slug,
    name,
    city,
    pictureUrl,
    rating,
    ratingCount,
    categories,
    openingHours,
    priceLevel,
    tags,
    distanceKm,
  } = restaurant;
  return (
    <article className="px-box px-card group relative flex h-full flex-col p-3 [--px-bg:var(--color-kartu)]">
      <div className="px-field relative aspect-[4/3] overflow-hidden">
        <div className="px-zoom absolute inset-0">
          <RestaurantImage
            src={pictureUrl}
            name={name}
            categories={categories}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
        <span className="px-go" aria-hidden="true">
          View ▶
        </span>
        <div className="absolute top-3 left-3">
          <OpenBadge openingHours={openingHours} />
        </div>
        {typeof distanceKm === "number" ? (
          <div className="absolute top-3 right-3">
            <Badge tone="langit">{distanceKm} km</Badge>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-2 pt-4 pb-2">
        <h3 className="text-xl leading-snug">
          <Link
            href={`/restaurants/${slug}`}
            className="after:absolute after:inset-0 hover:underline"
          >
            {name}
          </Link>
        </h3>
        <p className="text-terong-700 flex items-center gap-2 text-sm">
          <PixelIcon name="pin" size={2} />
          <span>{city || "Location not listed"}</span>
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <RatingBadge rating={rating} count={ratingCount} />
          <PriceLevel level={priceLevel} />
        </div>
        {categories[0] || tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {categories[0] ? (
              <Badge>
                {toTitleCase(categories[0].split(".").pop() ?? categories[0])}
              </Badge>
            ) : null}
            {tags.slice(0, 2).map((t) => (
              <Badge key={t} tone="krem">
                {TAG_LABEL[t] ?? t}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function RestaurantGrid({ restaurants }: { restaurants: RestaurantDTO[] }) {
  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((r, i) => (
        <li key={r.id} className="relative" style={{ ["--i" as string]: i % 9 }}>
          <RestaurantCard restaurant={r} />
        </li>
      ))}
    </ul>
  );
}
