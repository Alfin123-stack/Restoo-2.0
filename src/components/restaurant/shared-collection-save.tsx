"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { collectionsStore } from "@/features/collections/store";
import type { RestaurantDTO } from "@/types";

/** Saves a collection shared by a friend into your local favorites. */
export function SaveSharedCollection({
  name,
  restaurants,
}: {
  name: string;
  restaurants: RestaurantDTO[];
}) {
  const [saved, setSaved] = useState<"idle" | "ok" | "full">("idle");

  const save = async () => {
    const created = await collectionsStore.create(
      name,
      restaurants.map((r) => ({
        slug: r.slug,
        name: r.name,
        city: r.city,
        pictureUrl: r.pictureUrl,
        rating: r.rating,
      })),
    );
    setSaved(created ? "ok" : "full");
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="accent" onClick={() => void save()} disabled={saved === "ok"}>
        {saved === "ok" ? "Saved" : "Save to my collections"}
      </Button>
      <span role="status" className="text-sm font-bold">
        {saved === "ok" ? "Collection added to your favorites." : null}
        {saved === "full" ? "Couldn't save: collection limit reached." : null}
      </span>
    </div>
  );
}
