import { PixelPhoto } from "@/components/pixel/pixel-photo";
import Link from "next/link";
import type { FoodCategory, FoodSummary } from "@/lib/api/mealdb";
import { cn } from "@/lib/utils";

export function FoodCategoryRail({ categories }: { categories: FoodCategory[] }) {
  return (
    <ul
      className="-mx-4 flex gap-6 overflow-x-auto px-4 pt-2 pb-8 sm:-mx-6 sm:px-6"
      aria-label="Food categories"
    >
      {categories.map((c) => (
        <li key={c.id} className="shrink-0">
          <Link
            href={{ pathname: "/foods", query: { category: c.name } }}
            className="px-box px-card flex w-32 flex-col items-center gap-2 p-3 text-center [--px-bg:var(--color-kartu)]"
          >
            <span className="relative block size-20">
              <PixelPhoto src={c.thumb} sizes="80px" cols={40} fit="contain" />
            </span>
            <span className="font-eyebrow text-[12px] leading-4 uppercase">{c.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FoodCategoryTabs({
  categories,
  active,
}: {
  categories: FoodCategory[];
  active: string;
}) {
  return (
    <ul className="flex flex-wrap gap-4" aria-label="Choose a category">
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={{ pathname: "/foods", query: { category: c.name } }}
            aria-current={c.name === active ? "page" : undefined}
            className={cn(
              "px-box px-press font-label inline-flex min-h-12 items-center px-4 text-[13px] tracking-wider uppercase",
              c.name === active
                ? "[--px-bg:var(--color-kunyit-400)]"
                : "[--px-bg:var(--color-kartu)]",
            )}
          >
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FoodGrid({ foods }: { foods: FoodSummary[] }) {
  return (
    <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
      {foods.map((f) => (
        <li key={f.id} className="relative">
          <article className="px-box px-card h-full [--px-bg:var(--color-kartu)]">
            <div className="border-terong-900 relative aspect-square overflow-hidden border-b-4">
              <div className="px-zoom absolute inset-0">
                <PixelPhoto
                  src={f.thumb}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  cols={64}
                />
              </div>
              <span className="px-go" aria-hidden="true">
                Recipe ▶
              </span>
            </div>
            <h3 className="p-3 text-base leading-snug">
              <Link
                href={`/foods/${f.id}`}
                className="after:absolute after:inset-0 hover:underline"
              >
                {f.name}
              </Link>
            </h3>
          </article>
        </li>
      ))}
    </ul>
  );
}
