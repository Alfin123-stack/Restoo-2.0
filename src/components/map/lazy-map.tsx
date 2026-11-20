"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/** MapLibre is heavy (~200KB), so it only loads when the map is shown, and only in the browser. */
export const LazyMap = dynamic(() => import("./restaurant-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full min-h-72" />,
});
