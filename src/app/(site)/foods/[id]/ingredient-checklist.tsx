"use client";

import { useState } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { cn } from "@/lib/utils";

/** Ingredient list you can tick off while shopping or cooking. Kept only while the page is open. */
export function IngredientChecklist({
  ingredients,
}: {
  ingredients: { name: string; measure: string }[];
}) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (name: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (!next.delete(name)) next.add(name);
      return next;
    });

  return (
    <div className="mt-6">
      <p role="status" className="font-eyebrow mb-4 text-xs uppercase">
        {done.size} of {ingredients.length} ingredients ready
      </p>
      <ul className="px-box divide-terong-900/15 divide-y-2 [--px-bg:var(--color-kartu)]">
        {ingredients.map((i) => {
          const checked = done.has(i.name);
          return (
            <li key={i.name}>
              <button
                type="button"
                aria-pressed={checked}
                onClick={() => toggle(i.name)}
                className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left text-sm"
              >
                <span className="border-terong-900 bg-malam flex size-6 shrink-0 items-center justify-center border-4">
                  {checked ? <PixelIcon name="check" size={2} /> : null}
                </span>
                <span className={cn("flex-1", checked && "text-terong-500 line-through")}>
                  {i.name}
                </span>
                <span className="text-terong-500">{i.measure}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
