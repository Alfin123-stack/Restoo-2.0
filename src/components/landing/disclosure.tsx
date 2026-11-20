"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export type DisclosureItem = { index: string; title: string; body: string };

/** Numbered rows with a thin plus; one row open at a time. Each row names a concrete task. */
export function DisclosureList({ items }: { items: readonly DisclosureItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  return (
    <ul className="mt-8 space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.index}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${base}-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className={cn(
                "flex min-h-12 w-full items-center gap-3 rounded-[10px] border px-4 py-3 text-left text-[15px] transition-colors",
                "border-black/10 bg-white/60 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] hover:border-black/20 hover:bg-white",
                "dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10",
              )}
            >
              <span className="font-eyebrow text-terong-500 w-8 shrink-0 text-xs">
                {item.index}
              </span>
              <span className="font-medium">{item.title}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "text-terong-500 ml-auto text-xl leading-none font-light transition-transform duration-200",
                  isOpen && "rotate-45",
                )}
              >
                +
              </span>
            </button>
            <div
              id={`${base}-${i}`}
              hidden={!isOpen}
              className="text-terong-700 px-4 pt-2 pb-1 text-sm leading-6"
            >
              {item.body}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
