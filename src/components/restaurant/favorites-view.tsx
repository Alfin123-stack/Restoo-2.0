"use client";

import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { Mascot } from "@/components/pixel/sprite";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { fieldClass, labelClass } from "@/components/ui/fields";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavoritesStatus } from "@/features/favorites/use-favorites";
import { favoritesStore } from "@/features/favorites/store";
import { collectionsStore, MAX_COLLECTIONS } from "@/features/collections/store";
import { useCollections } from "@/features/collections/use-collections";
import { buildShareUrl, shareLink } from "@/features/collections/share";
import { BackupControls } from "./backup-controls";
import { ForYou } from "./for-you";
import { RatingBadge } from "./rating";
import { RestaurantImage } from "./restaurant-image";
import { cn } from "@/lib/utils";
import type { FavoriteRestaurant } from "@/types";

const FAVORITES = "favorites";
type Item = Omit<FavoriteRestaurant, "savedAt">;
const normalize = (value: string) => value.toLowerCase().replace(/\s/g, "");

function SavedCard({
  item,
  removeLabel,
  onRemove,
}: {
  item: Item;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <li className="relative">
      <article className="px-box px-lift flex h-full flex-col [--px-bg:var(--color-kartu)]">
        <div className="border-terong-900 relative aspect-[4/3] overflow-hidden border-b-4">
          <RestaurantImage
            src={item.pictureUrl}
            name={item.name}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="text-xl">
            <Link
              href={`/restaurants/${item.slug}`}
              className="after:absolute after:inset-0 hover:underline"
            >
              {item.name}
            </Link>
          </h3>
          <p className="text-terong-700 flex items-center gap-2 text-sm">
            <PixelIcon name="pin" size={2} />
            {item.city || "Location not listed"}
          </p>
          <RatingBadge rating={item.rating} />
        </div>
      </article>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel}: ${item.name}`}
        className="px-box px-press absolute top-3 right-3 z-10 flex size-10 items-center justify-center [--px-bg:var(--color-kartu)]"
      >
        <PixelIcon name="trash" size={2} />
      </button>
    </li>
  );
}

/** Favorites: saved restaurants + named collections, all stored on this device. */
export function FavoritesView() {
  const { favorites, loaded } = useFavoritesStatus();
  const { collections, loaded: collectionsLoaded } = useCollections();
  const [activeId, setActiveId] = useState(FAVORITES);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState("");
  const searchId = useId();
  const newId = useId();
  const renameId = useId();

  const activeCollection = collections.find((c) => c.id === activeId);
  const isFavorites = !activeCollection;
  const items: Item[] = isFavorites ? favorites : activeCollection.items;

  const visible = useMemo(() => {
    const needle = normalize(deferred);
    if (!needle) return items;
    return items.filter(
      (f) => normalize(f.name).includes(needle) || normalize(f.city).includes(needle),
    );
  }, [items, deferred]);

  const flash = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 3000);
  };

  if (!loaded || !collectionsLoaded) {
    return (
      <div
        role="status"
        aria-label="Loading favorites"
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  const createCollection = async (event: React.FormEvent) => {
    event.preventDefault();
    const created = await collectionsStore.create(newName);
    if (created) {
      setActiveId(created.id);
      setNewName("");
      setAdding(false);
    }
  };

  const share = async () => {
    if (!activeCollection || activeCollection.items.length === 0) return;
    const url = buildShareUrl(
      window.location.origin,
      activeCollection.name,
      activeCollection.items.map((i) => i.slug),
    );
    const result = await shareLink(url, `${activeCollection.name} collection on Restoo`);
    if (result === "copied") flash("Collection link copied!");
    else if (result === "failed") flash("Couldn't share the link.");
  };

  const tabClass = (selected: boolean) =>
    cn(
      "px-box px-press font-label min-h-12 max-w-56 truncate px-4 text-[13px] tracking-wider uppercase",
      selected ? "[--px-bg:var(--color-kunyit-400)]" : "[--px-bg:var(--color-kartu)]",
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4" aria-label="Choose a list">
        <button
          type="button"
          aria-pressed={isFavorites}
          onClick={() => {
            setActiveId(FAVORITES);
            setRenaming(false);
            setConfirmDelete(false);
          }}
          className={tabClass(isFavorites)}
        >
          ♥ Favorites ({favorites.length})
        </button>
        {collections.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={c.id === activeCollection?.id}
            onClick={() => {
              setActiveId(c.id);
              setRenaming(false);
              setConfirmDelete(false);
            }}
            className={tabClass(c.id === activeCollection?.id)}
          >
            {c.name} ({c.items.length})
          </button>
        ))}
        {collections.length < MAX_COLLECTIONS ? (
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            aria-expanded={adding}
            className="px-box px-press font-label inline-flex min-h-11 items-center gap-2 px-4 text-[15px] [--px-bg:var(--color-pandan-100)]"
          >
            <PixelIcon name="plus" size={2} />
            New collection
          </button>
        ) : null}
      </div>

      {adding ? (
        <form
          onSubmit={(e) => void createCollection(e)}
          className="px-box max-w-md space-y-3 p-4 [--px-bg:var(--color-kartu)]"
        >
          <label htmlFor={newId} className={labelClass}>
            Collection name
          </label>
          <div className="flex gap-3">
            <input
              id={newId}
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={40}
              placeholder="e.g. Places to try"
              className={fieldClass}
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-box px-press font-label min-h-11 px-5 text-[15px] [--px-bg:var(--color-kunyit-400)] disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      ) : null}

      {activeCollection ? (
        <div className="flex flex-wrap items-center gap-4">
          {renaming ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void collectionsStore.rename(activeCollection.id, draft);
                setRenaming(false);
              }}
              className="flex items-end gap-3"
            >
              <div>
                <label htmlFor={renameId} className={labelClass}>
                  New name
                </label>
                <input
                  id={renameId}
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={40}
                  className={fieldClass}
                />
              </div>
              <button
                type="submit"
                className="px-box px-press font-label min-h-11 px-5 text-[15px] [--px-bg:var(--color-kunyit-400)]"
              >
                Save
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void share()}
                disabled={activeCollection.items.length === 0}
                className="px-box px-press font-label inline-flex min-h-11 items-center gap-2 px-5 text-[15px] [--px-bg:var(--color-langit-300)] disabled:opacity-50"
              >
                <PixelIcon name="share" size={2} />
                Share
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(activeCollection.name);
                  setRenaming(true);
                }}
                className="px-box px-press font-label min-h-11 px-5 text-[15px] [--px-bg:var(--color-kartu)]"
              >
                Rename
              </button>
              {confirmDelete ? (
                <span className="inline-flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold">Delete this collection?</span>
                  <button
                    type="button"
                    onClick={() => {
                      void collectionsStore.remove(activeCollection.id);
                      setActiveId(FAVORITES);
                      setConfirmDelete(false);
                    }}
                    className="px-box px-press font-label text-terong-900 min-h-11 px-5 text-[15px] [--px-bg:var(--color-cabai-600)]"
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="font-eyebrow min-h-12 px-3 text-xs uppercase underline"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="font-eyebrow min-h-12 px-3 text-xs uppercase underline"
                >
                  Delete collection
                </button>
              )}
            </>
          )}
        </div>
      ) : null}
      <p role="status" className="text-pandan-700 min-h-6 text-sm font-bold">
        {notice}
      </p>

      {items.length === 0 ? (
        isFavorites ? (
          <EmptyState
            shop="cafe"
            title="Your favorites are empty"
            description="Tap the heart on a restaurant page and it shows up here, even when you're offline."
            action={<LinkButton href="/restaurants">Find restaurants</LinkButton>}
          />
        ) : (
          <EmptyState
            title="This collection is empty"
            description="Open a restaurant page, then choose “Collections” to add it here."
            action={<LinkButton href="/restaurants">Find restaurants</LinkButton>}
          />
        )
      ) : (
        <>
          <div className="max-w-md">
            <label htmlFor={searchId} className="sr-only">
              Search this list
            </label>
            <div className="relative">
              <PixelIcon
                name="search"
                size={2}
                className="text-terong-500 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
              />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or city"
                className={`${fieldClass} pl-11`}
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <p role="status" className="text-terong-700 flex items-center gap-3">
              <Mascot mood="sad" scale={3} />
              No matches for “{deferred}”.
            </p>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <SavedCard
                  key={item.slug}
                  item={item}
                  removeLabel={
                    isFavorites ? "Remove from favorites" : "Remove from collection"
                  }
                  onRemove={() =>
                    void (isFavorites
                      ? favoritesStore.remove(item.slug)
                      : collectionsStore.removeItem(activeCollection.id, item.slug))
                  }
                />
              ))}
            </ul>
          )}
        </>
      )}
      <ForYou />
      <BackupControls />
    </div>
  );
}
