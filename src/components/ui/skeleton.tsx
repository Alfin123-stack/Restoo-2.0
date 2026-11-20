import { Sprite } from "@/components/pixel/sprite";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("px-skeleton", className)} />;
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-busy="true"
      className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="px-box p-3 [--px-bg:var(--color-kartu)]">
          <Skeleton className="aspect-[4/3]" />
          <div className="space-y-3 px-2 pt-4 pb-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Pixel progress bar for loading states. */
export function PixelProgress({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="px-flat h-6 w-full max-w-xs overflow-hidden"
    >
      <div className="px-bar h-full w-full" />
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function SectionTitle({
  id,
  children,
  aside,
}: {
  id?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h2 id={id} className="text-3xl sm:text-4xl">
        {children}
      </h2>
      {aside}
    </div>
  );
}

/** Matches the restaurant page: framed hero, overlapping title card, three stat tiles. */
export function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading" aria-busy="true" className="mt-6">
      <div className="px-box p-2 [--px-bg:var(--color-langit-100)]">
        <Skeleton className="aspect-[16/8]" />
      </div>
      <div className="px-box relative z-10 mx-3 -mt-14 space-y-4 p-5 [--px-bg:var(--color-kartu)] sm:mx-10 sm:-mt-20 sm:p-8">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
      </div>
      <div className="mx-3 mt-8 grid grid-cols-3 gap-4 sm:mx-10">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Steaming bowl with a stepped progress bar: the page-level loading state. */
export function PixelLoader({ label = "Cooking up results" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 py-10">
      <div className="loader-bob">
        <Sprite name="bowl-steam" scale={5} fps={3} />
      </div>
      <div className="px-flat h-4 w-48 overflow-hidden">
        <div className="loader-bar h-full" />
      </div>
      <p className="font-eyebrow text-terong-700 text-xs">{label}</p>
    </div>
  );
}

/** Full-page route loading: header skeleton, filter panel and card grid. */
export function PageLoading({ cards = 6, label }: { cards?: number; label?: string }) {
  return (
    <div aria-busy="true">
      <section className="border-edge border-b">
        <div className="mx-auto max-w-6xl space-y-4 px-4 pt-12 pb-10 sm:px-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-11 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
      </section>
      <div className="mx-auto mt-10 max-w-6xl px-4 pb-12 sm:px-6">
        <Skeleton className="h-28" />
        <PixelLoader label={label} />
        <CardGridSkeleton count={cards} />
      </div>
    </div>
  );
}
