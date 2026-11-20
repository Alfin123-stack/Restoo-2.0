"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { spinGacha } from "@/actions/gacha";
import { sfx } from "@/lib/audio/sound";
import { FoodIcon, PixelIcon } from "@/components/pixel/pixel-art";
import { Mascot } from "@/components/pixel/sprite";
import { LikeButton } from "@/components/restaurant/like-button";
import { RatingBadge } from "@/components/restaurant/rating";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { fieldClass, labelClass } from "@/components/ui/fields";
import { FOODS, type FoodName } from "@/lib/pixel/art";
import { toTitleCase } from "@/lib/format";
import { PixelToggle } from "@/components/ui/pixel-toggle";
import { cn } from "@/lib/utils";
import type { RestaurantDTO } from "@/types";

const FOOD_NAMES = Object.keys(FOODS) as FoodName[];
const SPIN_MS = 1600;

function prefersReducedMotion() {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "off"
  );
}

export function GachaMachine({
  cities,
  categories,
}: {
  cities: string[];
  categories: string[];
}) {
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [mood, setMood] = useState("");
  const [seen, setSeen] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [reel, setReel] = useState<FoodName[]>(["es-teh", "sate", "bakso"]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RestaurantDTO | null>(null);
  const [message, setMessage] = useState("");
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  const spin = (skip = false) => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setMessage("");

    const instant = prefersReducedMotion();
    if (!instant) {
      timer.current = setInterval(() => {
        sfx("tick");
        setReel(() =>
          [0, 1, 2].map(() => FOOD_NAMES[Math.floor(Math.random() * FOOD_NAMES.length)]!),
        );
      }, 90);
    }

    const started = Date.now();
    startTransition(async () => {
      const exclude = skip && result ? [...seen, result.slug] : [];
      const outcome = await spinGacha({ city, category, openOnly, mood, exclude });
      const wait = instant ? 0 : Math.max(0, SPIN_MS - (Date.now() - started));
      setTimeout(() => {
        clearInterval(timer.current);
        if (outcome.ok) {
          const pick = FOOD_NAMES[Math.floor(Math.random() * FOOD_NAMES.length)]!;
          setReel([pick, pick, pick]);
          setResult(outcome.restaurant);
          sfx("win");
          setReason(outcome.reason);
          setSeen(skip && result ? [...seen, result.slug] : []);
        } else {
          setMessage(outcome.message);
        }
        setSpinning(false);
      }, wait);
    });
  };

  return (
    <div className="mt-10 space-y-10">
      <div className="px-box space-y-6 p-6 [--px-bg:var(--color-kartu)]">
        <div
          aria-hidden="true"
          className="px-box mx-auto w-fit max-w-full [--px-bg:var(--color-terong-900)]"
        >
          <div className="slot-bulbs" data-spinning={spinning} />
          <div className="flex items-center justify-center gap-4 p-5 sm:gap-6">
            {reel.map((name, i) => (
              <div
                key={i}
                className={cn(
                  "slot-window flex size-24 items-center justify-center [--px-ink:#0d0720] sm:size-28",
                  spinning && "bob",
                )}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <FoodIcon name={name} size={6} />
              </div>
            ))}
          </div>
          <div className="slot-bulbs" data-spinning={spinning} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="g-city" className={labelClass}>
              City
            </label>
            <select
              id="g-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={fieldClass}
            >
              <option value="">Anywhere</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="g-cat" className={labelClass}>
              Type
            </label>
            <select
              id="g-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldClass}
            >
              <option value="">Anything</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {toTitleCase(c.split(".").pop() ?? c)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="g-mood" className={labelClass}>
            Mood (optional)
          </label>
          <input
            id="g-mood"
            type="text"
            value={mood}
            maxLength={120}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g. rainy day, something warm and cheap"
            className={fieldClass}
          />
        </div>

        <PixelToggle label="Open now only" checked={openOnly} onChange={setOpenOnly} />

        <div className="flex justify-center">
          <Button
            onClick={() => spin()}
            disabled={spinning}
            className="min-h-14 px-8 text-sm"
          >
            <PixelIcon name="dice" size={3} />
            {spinning ? "Spinning…" : result ? "Spin again" : "Spin!"}
          </Button>
        </div>
      </div>

      <div role="status" aria-live="polite">
        {message ? (
          <div className="px-box flex items-center gap-5 p-5 [--px-bg:var(--color-kartu)]">
            <Mascot mood="sad" scale={5} />
            <p>{message}</p>
          </div>
        ) : null}

        {result ? (
          <div className="rise-in px-box space-y-5 p-6 [--px-bg:var(--color-kartu)]">
            <div className="flex items-start gap-5">
              <Mascot mood="happy" scale={5} />
              <div className="min-w-0">
                <p className="font-eyebrow text-terong-700 text-xs uppercase">
                  Chef Meong picks…
                </p>
                <h2 className="mt-1 text-3xl text-balance sm:text-4xl">{result.name}</h2>
                {reason ? (
                  <p className="mt-2 text-sm">
                    <span className="font-eyebrow uppercase">Why: </span>
                    {reason}
                  </p>
                ) : null}
                <p className="text-terong-700 mt-2 flex items-center gap-2">
                  <PixelIcon name="pin" size={2} />
                  {[result.address, result.city].filter(Boolean).join(", ") ||
                    "Location not listed"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <RatingBadge rating={result.rating} count={result.ratingCount} />
              {result.categories[0] ? (
                <Badge>
                  {toTitleCase(
                    result.categories[0].split(".").pop() ?? result.categories[0],
                  )}
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-start gap-5">
              <LinkButton href={`/restaurants/${result.slug}` as Route}>
                View details
                <PixelIcon name="play" size={2} />
              </LinkButton>
              <Button variant="secondary" onClick={() => spin(true)} disabled={spinning}>
                Not this one, skip
              </Button>
              <LikeButton
                restaurant={{
                  slug: result.slug,
                  name: result.name,
                  city: result.city,
                  pictureUrl: result.pictureUrl,
                  rating: result.rating,
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
      <p className="text-terong-500 text-sm">
        Prefer to browse yourself?{" "}
        <Link href="/restaurants" className="inline-block py-3 underline">
          Explore all restaurants
        </Link>
        .
      </p>
    </div>
  );
}
