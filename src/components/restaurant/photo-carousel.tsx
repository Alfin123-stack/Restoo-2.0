"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { RestaurantImage } from "@/components/restaurant/restaurant-image";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 5000;
const RESUME_AFTER_MS = 9000;

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia("(prefers-reduced-motion: reduce)");
      const mo = new MutationObserver(cb);
      mq.addEventListener("change", cb);
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-motion"],
      });
      return () => {
        mq.removeEventListener("change", cb);
        mo.disconnect();
      };
    },
    () =>
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.motion === "off",
    () => false,
  );
}

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 8 12"
      width="16"
      height="24"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path
        fill="currentColor"
        d={
          dir === "prev"
            ? "M5 0h2v2H5zM3 2h2v2H3zM1 4h2v4H1zM3 8h2v2H3zM5 10h2v2H5z"
            : "M1 0h2v2H1zM3 2h2v2H3zM5 4h2v4H5zM3 8h2v2H3zM1 10h2v2H1z"
        }
      />
    </svg>
  );
}

/**
 * Photo slider for the restaurant detail page. Native scroll-snap gives swipe for free; arrows,
 * dots and arrow keys move it, and it advances by itself every few seconds unless the person
 * hovers, focuses, pauses it, or prefers reduced motion. Without photos it shows the pixel storefront.
 */
export function PhotoCarousel({
  photos,
  name,
  categories,
  sizes,
  children,
}: {
  photos: string[];
  name: string;
  categories?: string[];
  sizes: string;
  children?: ReactNode;
}) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const slides = photos.filter((p) => !failed.has(p));
  const total = slides.length;

  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const holdUntil = useRef(0);
  const hovering = useRef(false);
  const focusing = useRef(false);
  const reduced = useReducedMotion();

  const goTo = useCallback(
    (i: number, smooth = true) => {
      const el = trackRef.current;
      if (!el || total === 0) return;
      const next = ((i % total) + total) % total;
      // The index follows the scroll position (onScroll); it is never set here, or a smooth
      // scroll in progress would fight it.
      el.scrollTo({
        left: next * el.clientWidth,
        behavior: smooth && !reduced ? "smooth" : "auto",
      });
    },
    [total, reduced],
  );

  const userMove = useCallback(
    (i: number) => {
      holdUntil.current = Date.now() + RESUME_AFTER_MS;
      goTo(i);
    },
    [goTo],
  );

  useEffect(() => {
    if (total < 2 || paused || reduced) return;
    const id = setInterval(() => {
      if (hovering.current || focusing.current || document.hidden) return;
      if (Date.now() < holdUntil.current) return;
      goTo(index + 1);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [total, paused, reduced, index, goTo]);

  // Keep the current slide in place when the width changes (rotation, resize).
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let width = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      el.scrollTo({ left: indexRef.current * width, behavior: "auto" });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [total]);

  if (total === 0) {
    return (
      <>
        <RestaurantImage
          src={null}
          name={name}
          categories={categories}
          sizes={sizes}
          className="pb-16 sm:pb-24"
        />
        {children}
      </>
    );
  }

  return (
    <div
      className="group absolute inset-0"
      role="region"
      aria-roledescription="carousel"
      aria-label={`Photos of ${name}`}
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      onFocus={() => (focusing.current = true)}
      onBlur={() => (focusing.current = false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") userMove(index - 1);
        if (e.key === "ArrowRight") userMove(index + 1);
      }}
    >
      <div
        ref={trackRef}
        tabIndex={total > 1 ? 0 : undefined}
        aria-live={paused || reduced ? "polite" : "off"}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
          if (i !== index) setIndex(i);
        }}
        onPointerDown={() => (holdUntil.current = Date.now() + RESUME_AFTER_MS)}
        className="flex size-full snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain focus-visible:outline-offset-[-4px] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((src, i) => (
          <div
            key={src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
            className="relative size-full shrink-0 snap-center"
          >
            <Image
              src={src}
              alt={i === 0 ? `Photo of ${name}` : `Photo ${i + 1} of ${name}`}
              fill
              sizes={sizes}
              priority={i === 0}
              loading={i === 0 ? undefined : "lazy"}
              className="object-cover"
              onError={() => setFailed((s) => new Set(s).add(src))}
            />
          </div>
        ))}
      </div>

      {children}

      {total > 1 ? (
        <>
          {(["prev", "next"] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              aria-label={dir === "prev" ? "Previous photo" : "Next photo"}
              onClick={() => userMove(index + (dir === "prev" ? -1 : 1))}
              className={cn(
                "btn btn-light absolute top-[40%] z-10 size-11 !min-h-11 -translate-y-1/2 !p-0",
                dir === "prev" ? "left-3" : "right-3",
              )}
            >
              <Arrow dir={dir} />
            </button>
          ))}
          <div className="absolute inset-x-0 bottom-[4.25rem] z-10 flex items-center justify-center gap-3 sm:bottom-[6.25rem]">
            <div className="bg-raised/90 flex items-center gap-1 rounded-full px-2 py-1 backdrop-blur-sm">
              {slides.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Go to photo ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => userMove(i)}
                  className="grid size-6 place-items-center"
                >
                  <span
                    className={cn(
                      "block size-2.5 transition-transform",
                      i === index
                        ? "scale-125 bg-[var(--c-leaf)] outline outline-2 outline-[var(--px-ink,#17171c)]"
                        : "bg-terong-500/55",
                    )}
                  />
                </button>
              ))}
              {!reduced ? (
                <button
                  type="button"
                  aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                  aria-pressed={paused}
                  onClick={() => setPaused((p) => !p)}
                  className="text-krem ml-1 grid size-6 place-items-center"
                >
                  <svg
                    viewBox="0 0 8 8"
                    width="12"
                    height="12"
                    aria-hidden="true"
                    shapeRendering="crispEdges"
                  >
                    <path
                      fill="currentColor"
                      d={
                        paused
                          ? "M1 0h2v8H1zM3 1h2v6H3zM5 2h2v4H5z"
                          : "M1 0h2v8H1zM5 0h2v8H5z"
                      }
                    />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
