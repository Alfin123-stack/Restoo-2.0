import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { connection } from "next/server";
import { FoodCategoryTabs, FoodGrid } from "@/components/food/food-components";
import { ErrorNotice } from "@/components/ui/empty-state";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import {
  getFoodCategories,
  getFoodsByCategory,
  type FoodCategory,
  type FoodSummary,
} from "@/lib/api/mealdb";

export async function generateMetadata(props: PageProps<"/foods">): Promise<Metadata> {
  const sp = await props.searchParams;
  const category = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  return {
    title: category ? `${category.slice(0, 40)} recipes` : "Foods",
    description:
      "Find food inspiration by category, with ingredients and how to make each dish.",
    alternates: {
      canonical: category ? `/foods?category=${encodeURIComponent(category)}` : "/foods",
    },
  };
}

export default function FoodsPage(props: PageProps<"/foods">) {
  return (
    <>
      <PageHero title="What do you want to cook?">
        Pick a category, then follow the ingredients and steps.
      </PageHero>
      <div className="mx-auto mt-10 max-w-6xl px-4 pb-12 sm:px-6">
        <Suspense
          fallback={
            <div className="mt-8">
              <CardGridSkeleton count={8} />
            </div>
          }
        >
          <FoodResults searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function FoodResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const sp = await searchParams;
  const requested = Array.isArray(sp.category) ? sp.category[0] : sp.category;

  let categories: FoodCategory[] | null = null;
  let foods: FoodSummary[] = [];
  let active = "";
  try {
    categories = await getFoodCategories();
    active =
      categories.find((c) => c.name === requested)?.name ?? categories[0]?.name ?? "";
    foods = active ? await getFoodsByCategory(active) : [];
  } catch (error) {
    console.error("Failed to load foods", error);
    categories = null;
  }

  if (!categories) {
    return (
      <div className="mt-8">
        <ErrorNotice
          title="Food data could not be loaded"
          description="Please try again in a moment."
        />
      </div>
    );
  }

  return (
    <>
      <div className="mt-8">
        <FoodCategoryTabs categories={categories} active={active} />
      </div>
      <h2 className="mt-12 mb-8 text-3xl">{active}</h2>
      <FoodGrid foods={foods} />
    </>
  );
}
