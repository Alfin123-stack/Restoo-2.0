"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { fieldClass } from "@/components/ui/fields";
import { useCollections } from "@/features/collections/use-collections";
import { collectionsStore, MAX_COLLECTIONS } from "@/features/collections/store";
import { cn } from "@/lib/utils";
import type { FavoriteRestaurant } from "@/types";

/** "Add to collection" menu on the detail page. */
export function CollectionMenu({
  restaurant,
}: {
  restaurant: Omit<FavoriteRestaurant, "savedAt">;
}) {
  const { collections, loaded } = useCollections();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const panelId = useId();
  const inputId = useId();

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    const created = await collectionsStore.create(name, [restaurant]);
    if (created) setName("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="px-box px-press font-label inline-flex min-h-11 items-center gap-2 px-5 text-[15px] [--px-bg:var(--color-kartu)]"
      >
        <PixelIcon name="plus" size={2} />
        Collections
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="px-box absolute z-30 mt-4 w-72 max-w-[calc(100vw-2rem)] space-y-4 p-4 [--px-bg:var(--color-kartu)]"
      >
        <p className="font-eyebrow text-xs uppercase">Save to collection</p>
        {!loaded ? (
          <p className="text-terong-500 text-sm">Loading…</p>
        ) : collections.length === 0 ? (
          <p className="text-terong-700 text-sm">
            No collections yet. Create your first one below.
          </p>
        ) : (
          <ul className="space-y-3">
            {collections.map((c) => {
              const inside = c.items.some((i) => i.slug === restaurant.slug);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={inside}
                    onClick={() =>
                      void (inside
                        ? collectionsStore.removeItem(c.id, restaurant.slug)
                        : collectionsStore.addItem(c.id, restaurant))
                    }
                    className={cn(
                      "px-flat flex min-h-11 w-full items-center gap-3 px-3 text-left text-sm font-bold",
                      inside
                        ? "[--px-bg:var(--color-pandan-100)]"
                        : "[--px-bg:var(--color-kartu)]",
                    )}
                  >
                    <span className="border-terong-900 bg-malam flex size-5 shrink-0 items-center justify-center border-2">
                      {inside ? <PixelIcon name="check" size={2} /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="text-terong-500 text-xs font-normal">
                      {c.items.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {collections.length < MAX_COLLECTIONS ? (
          <form onSubmit={(e) => void create(e)} className="space-y-2">
            <label htmlFor={inputId} className="font-eyebrow block text-xs uppercase">
              New collection
            </label>
            <div className="flex gap-3">
              <input
                id={inputId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="e.g. Date night"
                className={cn(fieldClass, "min-h-11")}
              />
              <button
                type="submit"
                disabled={!name.trim()}
                aria-label="Create collection"
                className="px-box px-press flex size-11 shrink-0 items-center justify-center [--px-bg:var(--color-kunyit-400)] disabled:opacity-50"
              >
                <PixelIcon name="plus" size={2} />
              </button>
            </div>
          </form>
        ) : null}
        <Link
          href="/favorites"
          className="font-eyebrow block text-xs uppercase underline"
        >
          Open favorites
        </Link>
      </div>
    </div>
  );
}
