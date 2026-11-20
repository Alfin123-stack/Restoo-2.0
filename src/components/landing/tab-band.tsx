"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FoodIcon, PixelIcon } from "@/components/pixel/pixel-art";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "ask", label: "Ask in your own words, Meong reads the rest." },
  { key: "gacha", label: "Can't decide? One spin picks a place." },
  { key: "map", label: "See places on a map that still opens offline." },
] as const;

function AskPanel() {
  return (
    <div className="grid gap-4 p-5 sm:p-8">
      <div className="bg-panel ml-auto max-w-sm rounded-xl px-4 py-3 text-sm">
        Cheap halal place, open now, with wifi
      </div>
      <div className="max-w-md space-y-2 text-sm">
        <p className="text-terong-700">Filters applied from your sentence:</p>
        <div className="flex flex-wrap gap-2">
          {["Halal", "Open now", "Wi-Fi", "Price: cheap"].map((c) => (
            <span
              key={c}
              className="px-flat bg-kunyit-400 text-terong-900 px-2.5 py-0.5 text-xs"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <Link href="/restaurants" className="btn btn-dark w-fit">
        Try it on real places
      </Link>
    </div>
  );
}

function GachaPanel() {
  return (
    <div className="flex flex-col items-center gap-5 p-6 sm:p-8">
      <div className="slot-window flex gap-3 p-3">
        {(["nasi-goreng", "bakso", "sate"] as const).map((f) => (
          <div
            key={f}
            className="bg-raised flex size-20 items-center justify-center rounded-lg"
          >
            <FoodIcon name={f} size={4} />
          </div>
        ))}
      </div>
      <Link href="/gacha" className="btn btn-dark">
        <PixelIcon name="dice" size={2} />
        Spin for dinner
      </Link>
    </div>
  );
}

function MapPanel() {
  return (
    <div className="grid items-center gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-8">
      <div className="bg-sky-soft relative h-44 overflow-hidden rounded-xl bg-[var(--c-sky-soft)] shadow-[inset_0_2px_6px_rgb(0_0_0/0.14)]">
        {[
          ["18%", "30%"],
          ["46%", "58%"],
          ["70%", "26%"],
          ["84%", "64%"],
        ].map(([l, t]) => (
          <span key={l} className="absolute" style={{ left: l, top: t }}>
            <PixelIcon name="pin" size={3} />
          </span>
        ))}
      </div>
      <div className="max-w-xs space-y-3 text-sm">
        <p className="text-terong-700">
          Pins for every place with coordinates. If the tiles can&apos;t load, a link
          opens the spot in OpenStreetMap instead.
        </p>
        <Link href="/restaurants" className="btn btn-dark w-fit">
          Open the list
        </Link>
      </div>
    </div>
  );
}

/** Three statements take turns lighting up; the panel below follows. Auto-cycling stops once you interact. */
export function TabBand() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.dataset.motion === "off") return;
    const id = setInterval(() => {
      if (!document.hidden) setActive((a) => (a + 1) % TABS.length);
    }, 4800);
    return () => clearInterval(id);
  }, [auto]);

  return (
    <div onPointerEnter={() => setAuto(false)} onFocus={() => setAuto(false)}>
      <div
        role="tablist"
        aria-label="Features"
        className="mx-auto grid max-w-3xl gap-2 text-center sm:grid-cols-3 sm:gap-0"
      >
        {TABS.map((t, i) => (
          <button
            key={t.key}
            role="tab"
            id={`band-tab-${t.key}`}
            aria-selected={active === i}
            aria-controls={`band-panel-${t.key}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => {
              setAuto(false);
              setActive(i);
            }}
            className={cn(
              "min-h-11 px-4 py-2 text-[15px] leading-snug transition-colors sm:border-l sm:border-white/25 sm:first:border-l-0",
              active === i
                ? "font-medium text-white"
                : "text-white/55 hover:text-white/80",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="px-box mx-auto mt-10 max-w-[900px] [--px-bg:var(--color-panel)] [--px-r:16px]">
        {TABS.map((t, i) => (
          <div
            key={t.key}
            role="tabpanel"
            id={`band-panel-${t.key}`}
            aria-labelledby={`band-tab-${t.key}`}
            hidden={active !== i}
            className="min-h-[260px]"
          >
            {t.key === "ask" ? (
              <AskPanel />
            ) : t.key === "gacha" ? (
              <GachaPanel />
            ) : (
              <MapPanel />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
