"use client";

import { useEffect, useState } from "react";

const items = [
  { state: "Ready", text: "Open-now filter applied" },
  { state: "Working", text: "Ask Meong is reading your craving" },
  { state: "Ready", text: "Saved to Favorites" },
  { state: "Ready", text: "Gacha picked tonight's dinner" },
  { state: "Working", text: "Finding places near you" },
  { state: "Ready", text: "Review summary ready" },
] as const;

const N = items.length;

function slotFor(position: number): string {
  if (position === 0) return "0";
  if (position === 1) return "1";
  if (position === 2) return "2";
  if (position === 3) return "exit";
  if (position === N - 1) return "enter";
  return "hidden";
}

/** Three green-glass status notes above the stall. A new one pops in from the top every few seconds. */
export function HeroNotifications() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.dataset.motion === "off") return;
    const id = setInterval(() => {
      if (!document.hidden) setTick((t) => t + 1);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-[132px] w-full" role="status" aria-live="off">
      {items.map((item, i) => {
        const position = (((tick - i) % N) + N) % N;
        return (
          <div key={item.text} className="notif" data-slot={slotFor(position)}>
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: item.state === "Working" ? "#9ad0ff" : "#8ff0a4" }}
            />
            <span className="opacity-80">{item.state}</span>
            <span className="font-medium">{item.text}</span>
          </div>
        );
      })}
    </div>
  );
}
