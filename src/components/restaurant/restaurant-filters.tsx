import Link from "next/link";
import { PixelToggle } from "@/components/ui/pixel-toggle";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { Button } from "@/components/ui/button";
import { fieldClass, labelClass } from "@/components/ui/fields";
import { NearMeButton } from "./near-me-button";
import { PRICE_LABEL, TAGS } from "@/lib/constants";
import { toTitleCase } from "@/lib/format";
import { SORTS, type RestaurantQuery } from "@/lib/search-params";

/** Plain GET form: works without JavaScript and keeps its state in the URL. */
export function RestaurantFilters({
  query,
  cities,
  categories,
}: {
  query: RestaurantQuery;
  cities: string[];
  categories: string[];
}) {
  const { q, city, category, tag, minRating, maxPrice, openNow, near, view, sort } =
    query;
  const advancedActive = Boolean(
    category || tag || minRating || maxPrice || openNow || near,
  );
  const activeCount = [category, tag, minRating, maxPrice, openNow, near].filter(
    Boolean,
  ).length;
  const hasFilter = Boolean(q || city || advancedActive);

  return (
    <form action="/restaurants" method="get" role="search" className="space-y-6">
      {view === "map" ? <input type="hidden" name="view" value="map" /> : null}
      {near ? (
        <>
          <input type="hidden" name="dekat" value={`${near.lat},${near.lng}`} />
          <input type="hidden" name="radius" value={near.radiusKm} />
        </>
      ) : null}

      <div className="grid gap-5 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
        <div>
          <label htmlFor="q" className={labelClass}>
            Search restaurants
          </label>
          <div className="relative">
            <PixelIcon
              name="search"
              size={2}
              className="text-terong-500 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
            />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Name, address, or menu"
              className={`${fieldClass} pl-11`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="city" className={labelClass}>
            City
          </label>
          <select id="city" name="city" defaultValue={city ?? ""} className={fieldClass}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className={labelClass}>
            Sort by
          </label>
          <select id="sort" name="sort" defaultValue={sort} className={fieldClass}>
            {SORTS.filter((o) => o.key !== "nearest" || near).map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Apply</Button>
      </div>

      <details open={advancedActive} className="group">
        <summary className="font-eyebrow inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-xs uppercase">
          <PixelIcon name="filter" size={2} />
          Advanced filters
          {activeCount > 0 ? (
            <span className="px-flat bg-kunyit-400 text-malam inline-flex min-w-6 justify-center px-2 py-0.5 text-xs [--px-bg:var(--color-kunyit-400)]">
              {activeCount}
            </span>
          ) : null}
        </summary>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="category" className={labelClass}>
              Type
            </label>
            <select
              id="category"
              name="category"
              defaultValue={category ?? ""}
              className={fieldClass}
            >
              <option value="">All types</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {toTitleCase(c.split(".").pop() ?? c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tag" className={labelClass}>
              Features
            </label>
            <select id="tag" name="tag" defaultValue={tag ?? ""} className={fieldClass}>
              <option value="">Any</option>
              {TAGS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="harga" className={labelClass}>
              Price
            </label>
            <select
              id="harga"
              name="harga"
              defaultValue={maxPrice ? String(maxPrice) : ""}
              className={fieldClass}
            >
              <option value="">Any price</option>
              {[1, 2, 3].map((p) => (
                <option key={p} value={p}>
                  {p === 3 ? "Any, up to " : "Up to "}
                  {PRICE_LABEL[p]?.toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rating" className={labelClass}>
              Rating
            </label>
            <select
              id="rating"
              name="rating"
              defaultValue={minRating ? String(minRating) : ""}
              className={fieldClass}
            >
              <option value="">Any rating</option>
              {[4, 3, 2].map((r) => (
                <option key={r} value={r}>
                  {r}+ stars
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-start gap-6">
          <PixelToggle name="buka" value="1" defaultChecked={openNow} label="Open now" />
        </div>
      </details>

      <div className="flex flex-wrap items-start gap-6">
        <NearMeButton active={Boolean(near)} />
        {hasFilter ? (
          <Link
            href={view === "map" ? "/restaurants?view=map" : "/restaurants"}
            className="font-eyebrow inline-flex min-h-12 items-center text-xs uppercase underline"
          >
            Clear filters
          </Link>
        ) : null}
      </div>
    </form>
  );
}
