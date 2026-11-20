"use client";

import { useSyncExternalStore } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { cn } from "@/lib/utils";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/** Switches light/dark by setting `data-theme` on <html>; the choice is kept on this device. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark" as const);
  const dark = theme === "dark";

  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("restoo-theme", next);
    } catch {
      /* storage unavailable */
    }
    for (const l of listeners) l();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "px-box px-press flex size-11 items-center justify-center [--px-bg:var(--color-kartu)]",
        className,
      )}
    >
      <PixelIcon name={dark ? "sun" : "moon"} size={3} />
    </button>
  );
}
