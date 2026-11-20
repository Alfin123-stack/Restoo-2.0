import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { FoodCategoryRail } from "@/components/food/food-components";
import { AskMeong } from "@/components/ai/ask-meong";
import { CountUp } from "@/components/landing/count-up";
import { DisclosureList } from "@/components/landing/disclosure";
import { HeroNotifications } from "@/components/landing/hero-notifications";
import { HeroScene } from "@/components/landing/hero-scene";
import { HubDiagram } from "@/components/landing/hub-diagram";
import { DishWords, LetterGrid } from "@/components/landing/letter-grid";
import { TabBand } from "@/components/landing/tab-band";
import { FoodIcon, PixelIcon } from "@/components/pixel/pixel-art";
import { PixelFringe } from "@/components/pixel/fringe";
import { RestaurantGrid } from "@/components/restaurant/restaurant-card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, ErrorNotice } from "@/components/ui/empty-state";
import { CardGridSkeleton, Skeleton } from "@/components/ui/skeleton";
import { aiEnabled } from "@/lib/ai/gemini";
import { TAGS } from "@/lib/constants";
import { getFoodCategories, type FoodCategory } from "@/lib/api/mealdb";
import { getFeaturedRestaurants, getSiteStats } from "@/lib/repositories/restaurants";
import type { RestaurantDTO } from "@/types";

const frame =
  "shadow-[inset_0_0_0.4px_1.5px_rgb(255_255_255/0.35),inset_0_2px_0_0_var(--lip),0_0_2px_0_var(--edge-dark),0_0_0_4px_var(--frame-ring)]";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-eyebrow text-terong-500 text-xs">{children}</p>;
}

/** Two-tone heading: ink first, then a softer continuation. */
function TwoTone({ a, b, className }: { a: string; b: string; className?: string }) {
  return (
    <>
      <span className={className}>{a}</span> <span className="tone-2">{b}</span>
    </>
  );
}

export default function HomePage() {
  return (
    <>
      {/* 1. Promise: full-screen pixel world under a translucent header */}
      <section
        data-hero
        aria-label="Welcome"
        className="relative -mt-[68px] h-[100svh] max-h-[900px] min-h-[640px] overflow-hidden"
      >
        <HeroScene />
        <div className="relative z-10 mx-auto h-full max-w-[1440px] px-5 pt-[calc(68px+clamp(2rem,10vh,6rem))]">
          <div className="max-w-[580px]">
            <h1
              className="hero-in text-[clamp(2rem,4.4vw+0.5rem,2.875rem)] leading-[1.08] text-balance text-white"
              style={{ "--i": 0 } as React.CSSProperties}
            >
              Find a place to eat that&apos;s open right now.
            </h1>
            <p
              className="hero-in mt-5 max-w-[540px] text-base leading-[1.4] text-white/85"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              Start with what you&apos;re craving. Restoo shows what&apos;s open, sums up
              real reviews, and keeps your favorites on your device, with no account.
            </p>
            <div
              className="hero-in mt-6 flex flex-wrap gap-3"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              <Link href="/restaurants?buka=1" className="btn btn-light">
                Show what&apos;s open now
              </Link>
              <Link href="/gacha" className="btn btn-glass">
                Roll the gacha
              </Link>
            </div>
          </div>
          <div className="absolute right-5 bottom-14 left-5 md:top-[40%] md:right-[7%] md:bottom-auto md:left-auto md:w-[300px]">
            <HeroNotifications />
          </div>
        </div>
        <PixelFringe
          edge="bottom"
          rows={14}
          seed={5}
          className="absolute inset-x-0 bottom-0 z-20"
        />
      </section>

      {/* 2. Proof: real counts only */}
      <section
        aria-label="Restoo in numbers"
        className="mx-auto max-w-[1100px] px-6 pt-6"
      >
        <Suspense fallback={<div className="h-24" />}>
          <Stats />
        </Suspense>
      </section>

      {/* 3. Definition + hub diagram + live Ask Meong */}
      <section aria-labelledby="what" className="mx-auto max-w-[1100px] px-6 pt-24">
        <h2
          id="what"
          className="mx-auto max-w-3xl text-center text-[clamp(1.75rem,3vw+0.75rem,2.5rem)] leading-[1.15] text-balance"
        >
          <TwoTone
            a="Restoo is a place-finding app"
            b="built to help you decide where to eat tonight."
          />
        </h2>
        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className={`bg-panel rounded-2xl p-4 sm:p-6 ${frame}`}>
            <HubDiagram />
          </div>
          <div
            className={`bg-raised flex flex-col justify-center rounded-2xl p-5 sm:p-7 ${frame}`}
          >
            <Eyebrow>Ask Meong</Eyebrow>
            <p className="text-heading mt-3 mb-5 text-xl leading-snug">
              Describe the place in your own words.
            </p>
            <AskMeong aiOn={aiEnabled()} />
          </div>
        </div>
        <dl className="mt-10 grid gap-6 text-sm sm:grid-cols-3">
          {[
            [
              "Open now",
              "Hours are checked against the clock, so you only see what you can walk into.",
            ],
            [
              "Real reviews",
              "Ratings and comments from people, with a short summary on each place.",
            ],
            [
              "Stays with you",
              "Favorites and collections live on your device and open without internet.",
            ],
          ].map(([t, d]) => (
            <div key={t}>
              <dt className="text-heading font-medium">{t}</dt>
              <dd className="text-terong-700 mt-1 leading-6">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 4. Chapters */}
      <Chapter
        id="find"
        label="1.0 · Find"
        a="Start with the craving."
        b="Restoo narrows the list."
        body="Pick what matters: halal, wifi, outdoor seating, a price range. Filters combine, and the list updates with what is open."
        items={[
          {
            index: "1.1",
            title: "Filter by what you need",
            body: "Halal, vegetarian, wifi, outdoor seating, delivery, reservations.",
          },
          {
            index: "1.2",
            title: "See only what is open",
            body: "Opening hours are read for the current time in the place's timezone.",
          },
          {
            index: "1.3",
            title: "Sort by rating or price",
            body: "Highest rated first, or the cheapest that is still good.",
          },
        ]}
        demo={<FindDemo />}
      />
      <Chapter
        id="check"
        label="2.0 · Check"
        a="Read before you walk."
        b="Meong sums up the reviews."
        body="Every place has reviews from people who ate there. A short summary pulls out what they agree on."
        items={[
          {
            index: "2.1",
            title: "Read real reviews",
            body: "Ratings, comments and dates, newest first.",
          },
          {
            index: "2.2",
            title: "Get a short summary",
            body: "Meong lists what people like and what to watch for.",
          },
          {
            index: "2.3",
            title: "Leave your own",
            body: "Reviews are checked for spam before they are shown.",
          },
        ]}
        demo={<CheckDemo />}
        reverse
      />
      <Chapter
        id="keep"
        label="3.0 · Keep"
        a="Save what you love."
        b="It stays on your device."
        body="Favorites and collections are stored locally, so they open on the bus with no signal. You can move them to another device any time."
        items={[
          {
            index: "3.1",
            title: "Favorite a place",
            body: "One tap on the heart, and it is saved to your favorites.",
          },
          {
            index: "3.2",
            title: "Group into collections",
            body: "Breakfast, coffee dates, late night. Share a collection by link.",
          },
          {
            index: "3.3",
            title: "Move to a new phone",
            body: "Save one file, then open it on your other device.",
          },
        ]}
        demo={<KeepDemo />}
      />

      {/* 5. Real places */}
      <section aria-labelledby="featured" className="mx-auto max-w-[1100px] px-6 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="featured"
            className="text-[clamp(1.75rem,3vw+0.75rem,2.5rem)] leading-[1.15]"
          >
            <TwoTone a="Popular spots," b="rated by people who went." />
          </h2>
          <Link href="/restaurants" className="btn btn-dark">
            View all
          </Link>
        </div>
        <div className="mt-10">
          <Suspense fallback={<CardGridSkeleton />}>
            <FeaturedRestaurants />
          </Suspense>
        </div>
      </section>

      {/* 6. Collection covers */}
      <section
        aria-labelledby="covers"
        className="relative mx-auto max-w-[1100px] px-6 pt-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="covers"
            className="text-[clamp(1.75rem,3vw+0.75rem,2.5rem)] leading-[1.15]"
          >
            <TwoTone a="Pick a shelf." b="Each one is a starting point." />
          </h2>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {(
            [
              ["halal", "Halal picks", "nasi-goreng", "#e9d5a6"],
              ["vegetarian", "Veggie friendly", "es-teh", "#bfe3b4"],
              ["wifi", "Cafes to work from", "kopi", "#cfe0f6"],
              ["outdoor", "Eat outside", "sate", "#f3c6b8"],
            ] as const
          ).map(([tag, title, food, tint], i) => (
            <li key={tag}>
              <Link
                href={`/restaurants?tag=${tag}` as Route}
                className={`bg-raised group block rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-1 ${frame}`}
              >
                <p className="text-heading text-xl">{title}</p>
                <div className="bg-edge my-3 h-px" />
                <div
                  className="flex aspect-[16/9] items-center justify-center rounded-lg"
                  style={{ background: tint }}
                >
                  <FoodIcon name={food} size={8} />
                </div>
                <p className="font-eyebrow text-terong-500 mt-3 flex justify-between text-xs">
                  <span>Collection 0{i + 1}</span>
                  <span>{TAGS.find((t) => t.key === tag)?.label}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 7. Immersive band */}
      <section
        aria-labelledby="band"
        className="relative mt-28 overflow-hidden bg-[var(--band)] pt-24 pb-28 text-white"
      >
        <PixelFringe
          edge="top"
          rows={14}
          seed={13}
          className="absolute inset-x-0 top-0 z-10"
        />
        <div
          className="band-deco band-tree-l top-4 left-0 hidden h-[300px] w-[190px] md:block"
          aria-hidden="true"
        />
        <div
          className="band-deco band-tree-r top-4 right-0 hidden h-[300px] w-[190px] md:block"
          aria-hidden="true"
        />
        <div
          className="band-deco band-cloud top-24 left-[14%] hidden h-[50px] w-[120px] lg:block"
          aria-hidden="true"
        />
        <div
          className="band-deco band-cloud top-40 right-[16%] hidden h-[40px] w-[96px] lg:block"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-[1100px] px-6">
          <h2
            id="band"
            className="mx-auto max-w-2xl text-center text-[clamp(1.75rem,3vw+0.75rem,2.5rem)] leading-[1.15] text-balance text-white"
          >
            All the ways to choose <span className="text-white/55">where to eat.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-white/80">
            Ask, spin, or browse the map. Every tool ends at the same place: a real
            restaurant you can walk into.
          </p>
          <div className="mt-12">
            <TabBand />
          </div>
        </div>
        <PixelFringe
          edge="bottom"
          rows={14}
          seed={29}
          className="absolute inset-x-0 bottom-0 z-10"
        />
      </section>

      {/* 8. Recipes + dish field */}
      <section aria-labelledby="dishes" className="mx-auto max-w-[1100px] px-6 pt-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="dishes"
            className="text-[clamp(1.5rem,2.4vw+0.75rem,2rem)] leading-[1.15]"
          >
            <TwoTone a="Craving something specific?" b="Start with the dish." />
          </h2>
          <p className="text-terong-700 mt-3">
            Search by dish name, or browse recipes if you would rather cook it yourself.
          </p>
        </div>
        <div className="mt-12">
          <LetterGrid />
          <DishWords />
        </div>
        <div className="mt-16">
          <Suspense fallback={<FoodRailSkeleton />}>
            <FoodCategories />
          </Suspense>
        </div>
      </section>

      {/* 9. Closing destination */}
      <section aria-labelledby="closing" className="mx-auto max-w-[1100px] px-6 pt-28">
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
          <div>
            <h2
              id="closing"
              className="text-[clamp(1.75rem,3vw+0.75rem,2.5rem)] leading-[1.15]"
            >
              <TwoTone
                a="Ready when you are hungry."
                b="Open the list, spin the gacha, or ask Meong."
              />
            </h2>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-1">
              {(
                [
                  ["/restaurants", "Restaurants"],
                  ["/foods", "Foods"],
                  ["/gacha", "Gacha"],
                  ["/favorites", "Favorites"],
                ] as const
              ).map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-terong-700 hover:text-krem inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`bg-raised relative mx-auto h-[475px] w-[350px] max-w-full rounded-2xl p-3 ${frame}`}
          >
            <div className="scene-static relative size-full overflow-hidden rounded-lg">
              <div className="scene-card absolute inset-0">
                <HeroScene />
              </div>
              <div className="glass absolute inset-x-3 top-3 rounded-lg p-4 text-white">
                <p className="text-[24px] leading-[1.15] font-medium">
                  Find a place to eat tonight.
                </p>
                <Link href="/restaurants?buka=1" className="btn btn-light mt-4">
                  Show what&apos;s open
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Chapter({
  id,
  label,
  a,
  b,
  body,
  items,
  demo,
  reverse,
}: {
  id: string;
  label: string;
  a: string;
  b: string;
  body: string;
  items: readonly { index: string; title: string; body: string }[];
  demo: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section aria-labelledby={id} className="mx-auto max-w-[1100px] px-6 pt-24">
      <div className="grid items-center gap-10 lg:grid-cols-[340px_1fr] lg:gap-[78px]">
        <div className={reverse ? "lg:order-2" : undefined}>
          <Eyebrow>{label}</Eyebrow>
          <h2
            id={id}
            className="mt-4 text-[clamp(1.75rem,2.6vw+0.75rem,2.25rem)] leading-[1.12]"
          >
            <TwoTone a={a} b={b} />
          </h2>
          <p className="text-terong-700 mt-5 leading-[1.4]">{body}</p>
          <DisclosureList items={items} />
        </div>
        <div className={reverse ? "lg:order-1" : undefined}>{demo}</div>
      </div>
    </section>
  );
}

function DemoShell({ children, note }: { children: React.ReactNode; note: string }) {
  return (
    <div className={`bg-panel rounded-2xl p-3 sm:p-5 ${frame}`}>
      {children}
      <p className="font-eyebrow text-terong-500 mt-3 text-xs">{note}</p>
    </div>
  );
}

function FindDemo() {
  return (
    <DemoShell note="Example">
      <div className="bg-raised rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {TAGS.slice(0, 4).map((t, i) => (
            <span
              key={t.key}
              className={`px-flat px-3 py-1 text-xs ${i < 2 ? "bg-kunyit-400 text-terong-900" : "bg-raised"}`}
            >
              {t.label}
            </span>
          ))}
        </div>
        <ul className="mt-4 divide-y divide-[var(--c-edge)]">
          {[
            ["Green Leaf Kitchen", "Open until 22:00", "4.6"],
            ["Sunrise Coffee", "Open until 23:00", "4.4"],
            ["Corner Noodle Bar", "Closes in 30 min", "4.3"],
          ].map(([n, h, r]) => (
            <li key={n} className="flex items-center gap-3 py-3 text-sm">
              <span className="bg-panel flex size-10 items-center justify-center rounded-lg">
                <PixelIcon name="pin" size={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-heading block truncate font-medium">{n}</span>
                <span className="text-terong-500 text-xs">{h}</span>
              </span>
              <span className="font-pixel text-heading">{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </DemoShell>
  );
}

function CheckDemo() {
  return (
    <DemoShell note="Example">
      <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr]">
        <div className="bg-raised rounded-xl p-5">
          <p className="text-terong-500 text-xs">Average rating</p>
          <p className="font-pixel text-heading mt-2 text-[44px] leading-none">
            <CountUp to={4.6} decimals={1} />
          </p>
          <div className="bg-edge mt-4 h-2 overflow-hidden rounded">
            <div
              className="h-full w-[92%] rounded"
              style={{ background: "var(--c-leaf)" }}
            />
          </div>
          <p className="text-terong-500 mt-2 text-xs">Based on 128 reviews</p>
        </div>
        <div className="bg-raised space-y-3 rounded-xl p-5 text-sm">
          <p className="font-eyebrow text-terong-500 text-xs">Meong&apos;s summary</p>
          <p className="text-heading">
            Most people mention the rich broth and the fast service.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Rich broth", "Fast", "Busy at lunch"].map((c) => (
              <span key={c} className="px-flat bg-panel px-2.5 py-0.5 text-xs">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

function KeepDemo() {
  return (
    <DemoShell note="Example">
      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["Breakfast", "kopi", 3],
            ["Coffee dates", "es-teh", 5],
            ["Late night", "sate", 2],
          ] as const
        ).map(([n, f, c]) => (
          <div key={n} className="bg-raised rounded-xl p-4">
            <FoodIcon name={f} size={3} />
            <p className="text-heading mt-3 font-medium">{n}</p>
            <p className="text-terong-500 text-xs">{c} places</p>
          </div>
        ))}
      </div>
    </DemoShell>
  );
}

async function Stats() {
  await connection();
  let stats: Awaited<ReturnType<typeof getSiteStats>> | null = null;
  try {
    stats = await getSiteStats();
  } catch (error) {
    console.error("Failed to load site stats", error);
  }
  if (!stats || stats.restaurants === 0) return null;
  const items = [
    ["restaurants", stats.restaurants],
    ["cities", stats.cities],
    ["reviews", stats.reviews],
  ] as const;
  return (
    <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-3">
      {items.map(([label, n]) => (
        <div
          key={label}
          className="bg-panel flex min-w-32 flex-col items-center rounded-xl px-5 py-3 shadow-[inset_0_2px_0_var(--lip),0_0_0_1px_var(--c-edge)]"
        >
          <span className="font-pixel text-heading text-2xl">
            <CountUp to={n} />
          </span>
          <span className="text-terong-500 text-xs">{label}</span>
        </div>
      ))}
    </div>
  );
}

function FoodRailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading categories"
      className="flex gap-6 overflow-hidden pt-2 pb-8"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-36 w-32 shrink-0" />
      ))}
    </div>
  );
}

// Data diambil per request (lalu di-cache lewat `use cache`), sehingga build tidak
// membutuhkan database maupun internet.
async function FoodCategories() {
  await connection();
  let categories: FoodCategory[] | null = null;
  try {
    categories = await getFoodCategories();
  } catch (error) {
    console.error("Failed to load food categories", error);
  }
  if (!categories) {
    return (
      <ErrorNotice
        title="Food categories could not be loaded"
        description="Reload the page in a moment. The rest of the app still works."
      />
    );
  }
  return <FoodCategoryRail categories={categories} />;
}

async function FeaturedRestaurants() {
  await connection();
  let restaurants: RestaurantDTO[] | null = null;
  try {
    restaurants = await getFeaturedRestaurants(6);
  } catch (error) {
    console.error("Failed to load featured restaurants", error);
  }
  if (!restaurants) {
    return (
      <ErrorNotice
        title="Restaurants could not be loaded"
        description="Please try again in a moment."
      />
    );
  }
  if (restaurants.length === 0) {
    return (
      <EmptyState
        title="No restaurants yet"
        description="We are adding places. Please check back soon."
        action={
          <LinkButton href="/favorites" variant="secondary">
            Open favorites
          </LinkButton>
        }
      />
    );
  }
  return <RestaurantGrid restaurants={restaurants} />;
}
