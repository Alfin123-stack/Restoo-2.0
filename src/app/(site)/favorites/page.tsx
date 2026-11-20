import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { connection } from "next/server";
import { SaveSharedCollection } from "@/components/restaurant/shared-collection-save";
import { FavoritesView } from "@/components/restaurant/favorites-view";
import { RestaurantGrid } from "@/components/restaurant/restaurant-card";
import { ErrorNotice } from "@/components/ui/empty-state";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { parseShared } from "@/features/collections/share";
import { getRestaurantsBySlugs } from "@/lib/repositories/restaurants";
import type { RestaurantDTO } from "@/types";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your favorite restaurants and collections, available offline too.",
  robots: { index: false, follow: true },
};

export default function FavoritesPage(props: PageProps<"/favorites">) {
  return (
    <>
      <PageHero title="Your saved places">
        Favorites and collections live on this device, so they open even without internet.
      </PageHero>
      <div className="mx-auto mt-10 max-w-6xl px-4 pb-12 sm:px-6">
        <Suspense fallback={null}>
          <Shared searchParams={props.searchParams} />
        </Suspense>
        <FavoritesView />
      </div>
    </>
  );
}

async function Shared({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const shared = parseShared(await searchParams);
  if (!shared) return null;

  let restaurants: RestaurantDTO[] | null = null;
  try {
    restaurants = await getRestaurantsBySlugs(shared.slugs);
  } catch (error) {
    console.error("Failed to load shared collection", error);
  }

  return (
    <section aria-labelledby="shared" className="mb-16 space-y-6">
      <div className="px-box space-y-4 p-5 [--px-bg:var(--color-langit-100)]">
        <p className="font-eyebrow text-xs uppercase">Shared with you</p>
        <h2 id="shared" className="text-3xl">
          {shared.name}
        </h2>
        {restaurants && restaurants.length > 0 ? (
          <SaveSharedCollection name={shared.name} restaurants={restaurants} />
        ) : null}
      </div>
      {!restaurants ? (
        <ErrorNotice
          title="Collection could not be loaded"
          description="Try reloading the page."
        />
      ) : restaurants.length === 0 ? (
        <p className="text-terong-700">
          The restaurants in this collection are no longer available.
        </p>
      ) : (
        <Suspense fallback={<CardGridSkeleton count={3} />}>
          <RestaurantGrid restaurants={restaurants} />
        </Suspense>
      )}
    </section>
  );
}
