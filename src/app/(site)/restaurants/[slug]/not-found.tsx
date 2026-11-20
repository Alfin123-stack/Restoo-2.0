import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";

export default function RestaurantNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <EmptyState
        mood="sad"
        title="Restaurant not found"
        description="The address may be wrong, or this restaurant has been removed from the list."
        action={<LinkButton href="/restaurants">View all restaurants</LinkButton>}
      />
    </div>
  );
}
