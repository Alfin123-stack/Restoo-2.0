import { ogCard, OG_SIZE } from "@/lib/og";
import { storefront } from "@/lib/pixel/storefront";

export const alt = "Restoo: find a place to eat that's open right now";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    title: "Find a place to eat that's open right now",
    subtitle: "Reviews, favorites and a gacha for when you can't decide.",
    grid: storefront("r", "warung"),
  });
}
