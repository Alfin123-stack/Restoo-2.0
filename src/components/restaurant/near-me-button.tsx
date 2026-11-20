"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { cn } from "@/lib/utils";

/** Fills ?dekat=lat,lng from the device location, then reloads the list sorted by distance. */
export function NearMeButton({ active }: { active: boolean }) {
  const router = useRouter();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");

  const apply = (value: string | null) => {
    const next = new URLSearchParams(search.toString());
    next.delete("page");
    if (value) {
      next.set("dekat", value);
      if (!next.has("radius")) next.set("radius", "5");
    } else {
      next.delete("dekat");
      next.delete("radius");
    }
    router.push(`/restaurants?${next.toString()}` as never);
  };

  const onClick = () => {
    if (active) return apply(null);
    if (!("geolocation" in navigator)) return setState("error");
    setState("busy");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState("idle");
        apply(`${pos.coords.latitude.toFixed(3)},${pos.coords.longitude.toFixed(3)}`);
      },
      () => setState("error"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        disabled={state === "busy"}
        className={cn(
          "px-box px-press font-label inline-flex min-h-12 items-center gap-2 px-5 text-[13px] tracking-wider uppercase disabled:opacity-60",
          active ? "[--px-bg:var(--color-langit-300)]" : "[--px-bg:var(--color-kartu)]",
        )}
      >
        <PixelIcon name="navigate" size={2} />
        {state === "busy" ? "Finding your location…" : active ? "Near me: on" : "Near me"}
      </button>
      {state === "error" ? (
        <p role="alert" className="text-cabai-700 mt-2 text-sm">
          Couldn&apos;t read your location. Allow location access in your browser, then
          try again.
        </p>
      ) : null}
    </div>
  );
}
