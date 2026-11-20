import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { connection } from "next/server";
import { Skeleton } from "@/components/ui/skeleton";
import { getFilterOptions } from "@/lib/repositories/restaurants";
import { GachaMachine } from "./gacha-machine";

export const metadata: Metadata = {
  title: "Food gacha",
  description:
    "Can't decide where to eat? Spin the gacha machine and let Chef Meong pick for you.",
};

export default function GachaPage() {
  return (
    <>
      <PageHero narrow title="What shall we eat today?">
        Pick a city or type if you like, then pull the lever. The result is random and you
        can always spin again.
      </PageHero>
      <div className="mx-auto mt-10 max-w-3xl px-4 pb-12 sm:px-6">
        <Suspense fallback={<Skeleton className="mt-10 h-96 w-full" />}>
          <Machine />
        </Suspense>
      </div>
    </>
  );
}

async function Machine() {
  await connection();
  let options = { cities: [] as string[], categories: [] as string[] };
  try {
    options = await getFilterOptions();
  } catch (error) {
    console.error("Gacha: failed to load options", error);
  }
  return <GachaMachine {...options} />;
}
