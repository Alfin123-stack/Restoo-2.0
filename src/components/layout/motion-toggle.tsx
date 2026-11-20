"use client";

import { useSyncExternalStore } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { cn } from "@/lib/utils";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getOn = () => document.documentElement.dataset.motion !== "off";

/** Animation switch: sets `data-motion="off"` on <html> and remembers the choice on this device. */
export function MotionToggle({
  compact = false,
  iconOnly = false,
}: {
  compact?: boolean;
  iconOnly?: boolean;
}) {
  const on = useSyncExternalStore(subscribe, getOn, () => true);

  const toggle = () => {
    const next = !getOn();
    if (next) delete document.documentElement.dataset.motion;
    else document.documentElement.dataset.motion = "off";
    try {
      localStorage.setItem("restoo-motion", next ? "on" : "off");
    } catch {
      /* storage unavailable */
    }
    for (const l of listeners) l();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={iconOnly ? "Animations" : undefined}
      title={`Animations are ${on ? "on" : "off"}. Click to turn ${on ? "off" : "on"}.`}
      className={cn(
        iconOnly && "flex w-11 items-center justify-center !px-0",
        "px-box px-press font-label min-h-11 text-[13px] tracking-wider uppercase",
        compact ? "px-3" : "px-4",
        on && !compact
          ? "[--px-bg:var(--color-pandan-500)]"
          : "[--px-bg:var(--color-kartu)]",
      )}
    >
      {iconOnly ? (
        <PixelIcon name={on ? "play" : "close"} size={2} />
      ) : (
        `${compact ? "Motion" : "Animations"}: ${on ? "on" : "off"}`
      )}
    </button>
  );
}
