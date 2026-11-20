"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <EmptyState
        mood="sad"
        title="Something went wrong"
        description="This page failed to load. Try again, and if it keeps failing, head back home."
        action={<Button onClick={() => reset()}>Try again</Button>}
      />
    </div>
  );
}
