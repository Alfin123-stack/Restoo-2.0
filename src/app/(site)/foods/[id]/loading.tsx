import { DetailSkeleton, PixelLoader } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <DetailSkeleton />
      <PixelLoader label="Loading recipe" />
    </div>
  );
}
