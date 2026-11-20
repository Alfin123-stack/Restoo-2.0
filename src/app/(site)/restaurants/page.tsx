import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AskMeong } from "@/components/ai/ask-meong";
import { PageHero } from "@/components/layout/page-hero";
import { connection } from "next/server";
import { LazyMap } from "@/components/map/lazy-map";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { Pagination } from "@/components/restaurant/pagination";
import { RestaurantFilters } from "@/components/restaurant/restaurant-filters";
import { RestaurantGrid } from "@/components/restaurant/restaurant-card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, ErrorNotice } from "@/components/ui/empty-state";
import { CardGridSkeleton, Skeleton } from "@/components/ui/skeleton";
import { aiEnabled } from "@/lib/ai/gemini";
import { isOpenNow } from "@/lib/opening-hours";
import {
  getFilterOptions,
  listAllMatching,
  listNearby,
  listRestaurants,
  paginateList,
} from "@/lib/repositories/restaurants";
import {
  parseRestaurantQuery,
  queryToParams,
  type RestaurantQuery,
  type SortKey,
} from "@/lib/search-params";
import { cn } from "@/lib/utils";
import type { Paginated, RestaurantDTO } from "@/types";

export async function generateMetadata(
  props: PageProps<"/restaurants">,
): Promise<Metadata> {
  const sp = await props.searchParams;
  const page = Number.parseInt(String(sp.page ?? "1"), 10);
  const hasFilters = Object.keys(sp).some((k) => k !== "page");
  return {
    title: "Restaurants",
    description:
      "Explore restaurants and filter by city, price, rating, and what is open now.",
    // Filter, sort and Ask Meong URLs are near-duplicates, so they are kept out of the index.
    alternates: {
      canonical: !hasFilters && page > 1 ? `/restaurants?page=${page}` : "/restaurants",
    },
    robots: hasFilters ? { index: false, follow: true } : undefined,
  };
}

export default function RestaurantsPage(props: PageProps<"/restaurants">) {
  return (
    <>
      <PageHero title="Find a place to eat tonight">
        Filter by what&apos;s open now, price, and rating, then save the ones you like.
      </PageHero>
      <div className="mx-auto mt-10 max-w-6xl px-4 pb-12 sm:px-6">
        <div className="px-box [--px-bg:var(--color-kartu)]">
          <div className="p-5">
            <h2 className="font-eyebrow mb-4 text-xs uppercase">Ask Meong</h2>
            <AskMeong aiOn={aiEnabled()} />
          </div>
          <div className="border-terong-900/30 border-t-2 p-5">
            <Suspense fallback={<Skeleton className="h-36" />}>
              <FilterPanel searchParams={props.searchParams} />
            </Suspense>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="mt-8">
              <CardGridSkeleton />
            </div>
          }
        >
          <Results searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}

function sortItems(items: RestaurantDTO[], sort: SortKey): RestaurantDTO[] {
  if (sort === "popular" || sort === "nearest") return items; // nearest = already ordered by distance
  const copy = [...items];
  if (sort === "rating")
    copy.sort(
      (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || b.ratingCount - a.ratingCount,
    );
  if (sort === "price") copy.sort((a, b) => (a.priceLevel ?? 9) - (b.priceLevel ?? 9));
  if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

/** Mengambil hasil sesuai jenis filter: dekat saya, buka sekarang, atau daftar biasa (paginasi di DB). */
async function loadResults(query: RestaurantQuery): Promise<{
  result: Paginated<RestaurantDTO>;
  mapItems: RestaurantDTO[];
}> {
  const page = query.page ?? 1;
  const needsAll =
    query.openNow || query.near || query.view === "map" || query.sort !== "popular";

  if (!needsAll) {
    const result = await listRestaurants(query);
    return { result, mapItems: [] };
  }
  let all = query.near
    ? await listNearby(query)
    : await listAllMatching({ ...query, page: undefined });
  if (query.openNow) all = all.filter((r) => isOpenNow(r.openingHours));
  all = sortItems(all, query.sort);
  return { result: paginateList(all, page), mapItems: all };
}

async function FilterPanel({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const query = parseRestaurantQuery(await searchParams);
  let options: { cities: string[]; categories: string[] } = {
    cities: [],
    categories: [],
  };
  try {
    options = await getFilterOptions();
  } catch (error) {
    console.error("Failed to load filter options", error);
  }
  return <RestaurantFilters query={query} {...options} />;
}

async function Results({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const query = parseRestaurantQuery(await searchParams);
  const params = queryToParams(query);

  let data: Awaited<ReturnType<typeof loadResults>> | null = null;
  try {
    data = await loadResults(query);
  } catch (error) {
    console.error("Failed to load restaurant list", error);
  }

  const viewHref = (view: "list" | "map") => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries({
      ...params,
      view: view === "map" ? "map" : undefined,
    })) {
      if (v) qs.set(k, v);
    }
    const s = qs.toString();
    return (s ? `/restaurants?${s}` : "/restaurants") as "/restaurants";
  };

  const pins = (data?.mapItems ?? [])
    .filter((r) => r.coordinates)
    .map((r) => ({
      slug: r.slug,
      name: r.name,
      city: r.city,
      lng: r.coordinates![0],
      lat: r.coordinates![1],
    }));

  return (
    <>
      {query.ask ? (
        <p
          role="status"
          className="px-box mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 p-4 [--px-bg:var(--color-pandan-100)]"
        >
          <span className="font-eyebrow text-xs uppercase">Meong understood</span>
          <span>{query.ask}</span>
          <Link href="/restaurants" className="font-eyebrow text-xs uppercase underline">
            Clear
          </Link>
        </p>
      ) : null}
      <div className="mt-10">
        {!data ? (
          <ErrorNotice
            title="The restaurant list could not be loaded"
            description="Please try again in a moment."
          />
        ) : data.result.items.length === 0 ? (
          <EmptyState
            mood="sad"
            shop="noodle"
            title="No restaurants found"
            description={
              query.openNow
                ? "Nothing is listed as open right now. Try turning off “Open now” or change the filters."
                : "Try another keyword or clear the filters you are using."
            }
            action={
              <div className="flex flex-wrap justify-center gap-5">
                <LinkButton href="/restaurants" variant="secondary">
                  Clear filters
                </LinkButton>
                <LinkButton href="/gacha">Let the gacha pick</LinkButton>
              </div>
            }
          />
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <p className="font-eyebrow text-xs uppercase" role="status">
                {data.result.total}{" "}
                {data.result.total === 1 ? "restaurant" : "restaurants"} found
                {query.near ? ` · radius ${query.near.radiusKm} km` : ""}
              </p>
              <div className="flex gap-4" role="group" aria-label="View">
                {(["list", "map"] as const).map((v) => (
                  <Link
                    key={v}
                    href={viewHref(v)}
                    aria-current={query.view === v ? "page" : undefined}
                    className={cn(
                      "px-box px-press font-label inline-flex min-h-11 items-center gap-2 px-4 text-[13px] tracking-wider uppercase",
                      query.view === v
                        ? "[--px-bg:var(--color-kunyit-400)]"
                        : "[--px-bg:var(--color-kartu)]",
                    )}
                  >
                    <PixelIcon name={v === "list" ? "list" : "pin"} size={2} />
                    {v === "list" ? "List" : "Map"}
                  </Link>
                ))}
              </div>
            </div>

            {query.view === "map" ? (
              pins.length > 0 ? (
                <LazyMap
                  pins={pins}
                  userLocation={
                    query.near ? { lat: query.near.lat, lng: query.near.lng } : undefined
                  }
                  className="mb-10 h-[420px] w-full sm:h-[520px]"
                />
              ) : (
                <p className="text-terong-700 mb-10">
                  These results have no coordinates yet, so they cannot be shown on the
                  map.
                </p>
              )
            ) : null}

            <RestaurantGrid restaurants={data.result.items} />
            <Pagination
              page={data.result.page}
              pageCount={data.result.pageCount}
              basePath="/restaurants"
              params={params}
            />
          </>
        )}
      </div>
    </>
  );
}
