import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LazyMap } from "@/components/map/lazy-map";
import { FoodIcon, PixelIcon, PlateIcon } from "@/components/pixel/pixel-art";
import { CollectionMenu } from "@/components/restaurant/collection-menu";
import { LikeButton } from "@/components/restaurant/like-button";
import { OpenBadge } from "@/components/restaurant/open-badge";
import { PriceLevel } from "@/components/restaurant/price-level";
import { RatingBadge } from "@/components/restaurant/rating";
import { PhotoCarousel } from "@/components/restaurant/photo-carousel";
import { ShareButton } from "@/components/restaurant/share-button";
import { Badge } from "@/components/ui/badge";
import { DialogBox } from "@/components/ui/dialog-box";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { TAG_LABEL } from "@/lib/constants";
import { formatDate, toTitleCase } from "@/lib/format";
import { getOpenStatus } from "@/lib/opening-hours";
import type { FoodName } from "@/lib/pixel/art";
import { getRestaurantBySlug } from "@/lib/repositories/restaurants";
import { ReviewSummaryCard } from "@/components/ai/review-summary";
import { listReviews } from "@/lib/repositories/reviews";
import { SITE_URL } from "@/lib/site";
import { ReviewForm } from "./_components/review-form";

export async function generateMetadata(
  props: PageProps<"/restaurants/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return { title: "Restaurant not found" };

  const description =
    restaurant.description ??
    `${restaurant.name}${restaurant.city ? ` in ${restaurant.city}` : ""}. See info, menu, and reviews.`;
  return {
    title: restaurant.name,
    description,
    alternates: { canonical: `/restaurants/${restaurant.slug}` },
    openGraph: {
      title: restaurant.name,
      description,
      ...(restaurant.pictureUrl ? { images: [restaurant.pictureUrl] } : {}),
    },
  };
}

export default function RestaurantPage(props: PageProps<"/restaurants/[slug]">) {
  // The lookup runs inside Suspense (route params are runtime data). An unknown slug still
  // renders the not-found page, and Next marks it noindex, so it cannot be indexed.
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Suspense fallback={<DetailSkeleton />}>
        <RestaurantDetail params={props.params} />
      </Suspense>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading restaurant" className="mt-6 space-y-6">
      <Skeleton className="aspect-[16/7] w-full" />
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  );
}

const MENU_ICONS: [RegExp, FoodName][] = [
  [/teh|tea|es |iced/i, "es-teh"],
  [/sate|satay/i, "sate"],
  [/bakso|soto|mie|mi /i, "bakso"],
  [/ayam|chicken|bebek|duck|goreng|fried/i, "ayam"],
  [/nasi|rice|rames|lontong/i, "nasi-goreng"],
  [/kopi|coffee|susu|milk|latte/i, "kopi"],
];

function MenuList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="px-box p-5 [--px-bg:var(--color-kartu)]">
      <h3 className="mb-4 text-2xl">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => {
          const icon = MENU_ICONS.find(([rx]) => rx.test(item))?.[1];
          return (
            <li key={item} className="flex items-center gap-3">
              {icon ? <FoodIcon name={icon} size={3} /> : <PlateIcon size={3} />}
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

async function RestaurantDetail({ params }: { params: Promise<{ slug: string }> }) {
  // Status buka/tutup bergantung waktu, jadi bagian ini dirender per request.
  await connection();
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const reviews = await listReviews(restaurant.id);
  const hasMenu = restaurant.menus.foods.length > 0 || restaurant.menus.drinks.length > 0;
  const [lng, lat] = restaurant.coordinates ?? [];
  const status = getOpenStatus(restaurant.openingHours);
  const favoriteItem = {
    slug: restaurant.slug,
    name: restaurant.name,
    city: restaurant.city,
    pictureUrl: restaurant.pictureUrl,
    rating: restaurant.rating,
  };

  const cuisines = restaurant.categories
    .map((c) => c.split(".").pop() ?? c)
    .map((c) => toTitleCase(c))
    .filter((c) => !/^(restaurant|catering)$/i.test(c));
  const simpleHours = /^(?:(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:,\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))*\s+\d{2}:\d{2}-\d{2}:\d{2}(?:;\s*)?)+$/;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Restaurants", item: `${SITE_URL}/restaurants` },
      {
        "@type": "ListItem",
        position: 3,
        name: restaurant.name,
        item: `${SITE_URL}/restaurants/${restaurant.slug}`,
      },
    ],
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url: `${SITE_URL}/restaurants/${restaurant.slug}`,
    image: restaurant.pictureUrls.length ? restaurant.pictureUrls : undefined,
    address: restaurant.address
      ? {
          "@type": "PostalAddress",
          streetAddress: restaurant.address,
          addressLocality: restaurant.city,
          addressCountry: "ID",
        }
      : undefined,
    geo: restaurant.coordinates
      ? { "@type": "GeoCoordinates", latitude: lat, longitude: lng }
      : undefined,
    telephone: restaurant.phone ?? undefined,
    servesCuisine: cuisines.length ? cuisines : undefined,
    priceRange: restaurant.priceLevel ? "$".repeat(restaurant.priceLevel) : undefined,
    openingHours: simpleHours.test(restaurant.openingHours ?? "")
      ? restaurant.openingHours!
      : undefined,
    hasMenu:
      restaurant.menus.foods.length > 0
        ? {
            "@type": "Menu",
            hasMenuSection: {
              "@type": "MenuSection",
              name: "Food",
              hasMenuItem: restaurant.menus.foods.slice(0, 20).map((name) => ({
                "@type": "MenuItem",
                name,
              })),
            },
          }
        : undefined,
    aggregateRating:
      restaurant.rating !== null
        ? {
            "@type": "AggregateRating",
            ratingValue: restaurant.rating,
            reviewCount: restaurant.ratingCount,
          }
        : undefined,
  };

  const infoTab = (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        <section aria-labelledby="about">
          <h2 id="about" className="text-3xl">
            About
          </h2>
          <p className="text-terong-700 mt-4 max-w-prose text-lg">
            {restaurant.description ??
              "No description has been added for this restaurant yet."}
          </p>
        </section>
        {restaurant.coordinates ? (
          <section aria-labelledby="location">
            <h2 id="location" className="text-3xl">
              Location
            </h2>
            <LazyMap
              pins={[
                {
                  slug: restaurant.slug,
                  name: restaurant.name,
                  city: restaurant.city,
                  lng: lng!,
                  lat: lat!,
                },
              ]}
              zoom={16}
              label={`Map showing ${restaurant.name}`}
              className="mt-5 h-72 w-full"
            />
          </section>
        ) : null}
      </div>

      <aside
        aria-label="Information"
        className="px-box h-fit space-y-5 p-5 [--px-bg:var(--color-kartu)]"
      >
        <h2 className="text-2xl">Information</h2>
        <dl className="space-y-5 text-sm">
          <div className="flex gap-3">
            <PixelIcon name="clock" size={3} className="mt-0.5" />
            <div>
              <dt className="font-eyebrow text-xs uppercase">
                Opening hours
              </dt>
              <dd className="text-terong-700 mt-1">
                {restaurant.openingHours ?? "Not listed"}
                {status.state !== "unknown" ? (
                  <span className="mt-1 block font-bold">{status.label}</span>
                ) : null}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <PixelIcon name="phone" size={3} className="mt-0.5" />
            <div>
              <dt className="font-eyebrow text-xs uppercase">Phone</dt>
              <dd className="text-terong-700 mt-1">
                {restaurant.phone ? (
                  <a
                    href={`tel:${restaurant.phone.replace(/[^+\d]/g, "")}`}
                    className="underline"
                  >
                    {restaurant.phone}
                  </a>
                ) : (
                  "Not listed"
                )}
              </dd>
            </div>
          </div>
          {restaurant.website ? (
            <div className="flex gap-3">
              <PixelIcon name="globe" size={3} className="mt-0.5" />
              <div>
                <dt className="font-eyebrow text-xs uppercase">
                  Website
                </dt>
                <dd className="mt-1">
                  <a
                    href={restaurant.website}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-pandan-700 font-bold break-all underline"
                  >
                    Visit website
                  </a>
                </dd>
              </div>
            </div>
          ) : null}
        </dl>
        {restaurant.coordinates ? (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-box px-press font-label inline-flex min-h-11 items-center gap-2 px-5 text-[15px] [--px-bg:var(--color-langit-300)]"
          >
            <PixelIcon name="navigate" size={2} />
            Get directions
          </a>
        ) : null}
      </aside>
    </div>
  );

  const menuTab = hasMenu ? (
    <div className="grid gap-8 sm:grid-cols-2">
      <MenuList title="Food" items={restaurant.menus.foods} />
      <MenuList title="Drinks" items={restaurant.menus.drinks} />
    </div>
  ) : (
    <p className="text-terong-700">No menu has been added for this restaurant yet.</p>
  );

  const reviewTab = (
    <section aria-labelledby="reviews" className="max-w-3xl">
      <h2 id="reviews" className="text-3xl">
        Review ({restaurant.ratingCount})
      </h2>
      <div className="mt-6">
        <Suspense fallback={null}>
          <ReviewSummaryCard restaurantId={restaurant.id} />
        </Suspense>
      </div>
      {reviews.length === 0 ? (
        <p className="text-terong-700 mt-4">No reviews yet. Be the first to write one.</p>
      ) : (
        <ul className="mt-12 space-y-12">
          {reviews.map((review) => (
            <li key={review.id}>
              <DialogBox
                name={review.name}
                rating={review.rating}
                date={formatDate(review.createdAt)}
              >
                {review.comment}
              </DialogBox>
            </li>
          ))}
        </ul>
      )}

      <div className="px-box mt-14 p-5 [--px-bg:var(--color-kartu)] sm:p-6">
        <h3 className="text-2xl">Write a review</h3>
        <div className="mt-5">
          <ReviewForm restaurantId={restaurant.id} />
        </div>
      </div>
    </section>
  );

  const breadcrumb = (
    <nav aria-label="Breadcrumb">
      <ol className="font-eyebrow flex flex-wrap items-center gap-x-2 text-xs uppercase">
        <li>
          <Link href="/" className="inline-flex min-h-11 min-w-11 items-center hover:underline">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            href="/restaurants"
            className="inline-flex min-h-11 min-w-11 items-center hover:underline"
          >
            Restaurants
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-terong-700 max-w-[60vw] truncate">
          {restaurant.name}
        </li>
      </ol>
    </nav>
  );

  return (
    <article>
      {breadcrumb}
      <script
        type="application/ld+json"
        // The "<" character is escaped so the JSON cannot close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="px-box p-2 [--px-bg:var(--color-langit-100)]">
        <div className="px-field relative aspect-[4/3] overflow-hidden sm:aspect-[16/8]">
          <PhotoCarousel
            photos={restaurant.pictureUrls}
            name={restaurant.name}
            categories={restaurant.categories}
            sizes="(min-width: 1152px) 1100px, 100vw"
          >
            <div className="absolute top-4 left-4 z-10">
              <OpenBadge openingHours={restaurant.openingHours} />
            </div>
          </PhotoCarousel>
        </div>
      </div>

      <div className="px-box relative z-10 mx-3 -mt-14 flex flex-wrap items-start justify-between gap-6 p-5 [--px-bg:var(--color-kartu)] sm:mx-10 sm:-mt-20 sm:p-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-[clamp(2.25rem,6vw+0.5rem,3.75rem)] leading-[1.05] text-balance">{restaurant.name}</h1>
          <p className="text-terong-700 mt-3 flex items-start gap-2">
            <PixelIcon name="pin" size={3} className="mt-1" />
            {[restaurant.address, restaurant.city].filter(Boolean).join(", ") ||
              "Address not listed"}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {restaurant.categories.map((c) => (
              <Badge key={c}>{toTitleCase(c.split(".").pop() ?? c)}</Badge>
            ))}
            {restaurant.tags.map((t) => (
              <Badge key={t} tone="krem">
                {TAG_LABEL[t] ?? t}
              </Badge>
            ))}
          </div>
        </div>
        <div className="max-md:border-terong-900 max-md:bg-malam flex flex-wrap items-start gap-5 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:flex-nowrap max-md:justify-center max-md:gap-2 max-md:border-t-4 max-md:p-2 max-md:pb-[max(0.5rem,env(safe-area-inset-bottom))] max-md:[@media(max-height:480px)]:static max-md:[@media(max-height:480px)]:border-t-0 max-md:[&_button]:min-h-11 max-md:[&_button]:gap-1 max-md:[&_button]:px-3 max-md:[&_button]:text-[12px]">
          <LikeButton restaurant={favoriteItem} />
          <CollectionMenu restaurant={favoriteItem} />
          <ShareButton path={`/restaurants/${restaurant.slug}`} title={restaurant.name} />
        </div>
      </div>

      <dl className="mx-3 mt-8 grid grid-cols-3 gap-4 sm:mx-10">
        <StatTile label="Rating">
          <RatingBadge rating={restaurant.rating} count={restaurant.ratingCount} />
        </StatTile>
        <StatTile label="Price">
          <PriceLevel level={restaurant.priceLevel} />
        </StatTile>
        <StatTile label="Status">
          <OpenBadge openingHours={restaurant.openingHours} />
        </StatTile>
      </dl>

      <div className="mt-12 pb-24 md:pb-0">
        <Tabs
          tabs={[
            { id: "info", label: "Info", content: infoTab },
            { id: "menu", label: "Menu", content: menuTab },
            {
              id: "review",
              label: `Review (${restaurant.ratingCount})`,
              content: reviewTab,
            },
          ]}
        />
      </div>
    </article>
  );
}

function StatTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-box flex flex-col items-center gap-2 p-3 text-center [--px-bg:var(--color-kartu)]">
      <dt className="font-eyebrow text-terong-700 text-[12px] uppercase">
        {label}
      </dt>
      <dd className="flex min-h-8 items-center justify-center">{children}</dd>
    </div>
  );
}
