import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { ErrorNotice } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getFoodById, type FoodDetail } from "@/lib/api/mealdb";
import { IngredientChecklist } from "./ingredient-checklist";
import { VideoButton } from "./video-button";

export async function generateMetadata(
  props: PageProps<"/foods/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const base: Metadata = {
    robots: { index: false, follow: true }, // third-party recipe data, no original content yet
    alternates: { canonical: `/foods/${id}` },
  };
  if (!/^\d+$/.test(id)) return { ...base, title: "Recipe not found" };
  try {
    const food = await getFoodById(id);
    if (!food) return { ...base, title: "Recipe not found" };
    return {
      ...base,
      title: `${food.name} recipe`,
      description: `Ingredients and steps for ${food.name}${food.area ? `, a ${food.area} dish` : ""}.`,
      openGraph: { title: `${food.name} recipe`, images: [food.thumb] },
    };
  } catch {
    return { ...base, title: "Recipe" };
  }
}

export default function FoodPage(props: PageProps<"/foods/[id]">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb">
        <ol className="font-eyebrow flex flex-wrap items-center gap-x-2 text-xs uppercase">
          <li>
            <Link
              href="/"
              className="inline-flex min-h-11 min-w-11 items-center hover:underline"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/foods"
              className="inline-flex min-h-11 min-w-11 items-center hover:underline"
            >
              Foods
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Recipe</li>
        </ol>
      </nav>
      <Suspense fallback={<Skeleton className="mt-6 h-96 w-full" />}>
        <Food params={props.params} />
      </Suspense>
    </div>
  );
}

async function Food({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let food: FoodDetail | null = null;
  let failed = false;
  try {
    food = await getFoodById(id);
  } catch (error) {
    console.error("Failed to load recipe", error);
    failed = true;
  }
  if (failed) {
    return (
      <div className="mt-6">
        <ErrorNotice
          title="The recipe could not be loaded"
          description="Try reloading this page."
        />
      </div>
    );
  }
  if (!food) notFound();

  return (
    <article className="mt-6">
      <div className="grid gap-10 md:grid-cols-[18rem_1fr]">
        <div className="px-box relative aspect-square overflow-hidden [--px-bg:var(--color-kartu)]">
          <Image
            src={food.thumb}
            alt={food.name}
            fill
            priority
            sizes="(min-width: 768px) 288px, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-[clamp(2.25rem,6vw+0.5rem,3.75rem)] leading-[1.05] text-balance">
            {food.name}
          </h1>
          <p className="mt-5 flex flex-wrap gap-3">
            {food.category ? <Badge>{food.category}</Badge> : null}
            {food.area ? <Badge tone="kunyit">{food.area}</Badge> : null}
            {food.tags.map((t) => (
              <Badge key={t} tone="krem">
                {t}
              </Badge>
            ))}
          </p>
          <div className="mt-8 flex flex-wrap gap-5">
            <LinkButton
              href={{ pathname: "/restaurants", query: { q: food.name.split(" ")[0] } }}
              variant="primary"
            >
              <PixelIcon name="search" size={2} />
              Find restaurants serving this
            </LinkButton>
            {food.youtube ? <VideoButton url={food.youtube} title={food.name} /> : null}
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-[20rem_1fr]">
        <section aria-labelledby="ingredients">
          <h2 id="ingredients" className="text-3xl">
            Ingredients
          </h2>
          <IngredientChecklist ingredients={food.ingredients} />
        </section>
        <section aria-labelledby="method">
          <h2 id="method" className="text-3xl">
            How to make it
          </h2>
          <ol className="mt-6 space-y-5">
            {food.instructions
              .split(/\n+/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((p, i) => (
                <li key={i} className="flex gap-4">
                  <span className="px-flat font-label flex size-9 shrink-0 items-center justify-center text-[13px] [--px-bg:var(--color-kunyit-400)]">
                    {i + 1}
                  </span>
                  <p className="text-terong-700 max-w-prose">{p}</p>
                </li>
              ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
