import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <EmptyState
        mood="sad"
        title="Page not found"
        description="That address does not exist. Start from the home page to find a restaurant."
        action={<LinkButton href="/">Back to home</LinkButton>}
      />
    </div>
  );
}
