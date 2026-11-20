import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "You are offline", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <EmptyState
        mood="sad"
        title="You are offline"
        description="You have not opened this page while online yet. Your favorites are still available."
        action={<LinkButton href="/favorites">Open favorites</LinkButton>}
      />
    </div>
  );
}
