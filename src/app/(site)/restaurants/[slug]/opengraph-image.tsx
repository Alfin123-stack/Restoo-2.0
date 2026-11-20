import { ogCard, OG_SIZE } from "@/lib/og";
import { toTitleCase } from "@/lib/format";
import { STOREFRONT_AWNINGS, shopKind, storefront } from "@/lib/pixel/storefront";
import { getRestaurantBySlug } from "@/lib/repositories/restaurants";

export const alt = "Restaurant on Restoo";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  const name = r?.name ?? "Restaurant";
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const awning = STOREFRONT_AWNINGS[h % STOREFRONT_AWNINGS.length]!;
  const rating = r?.rating ? `${r.rating.toFixed(1)} / 5` : null;
  const subtitle = [r?.city ? toTitleCase(r.city) : null, rating]
    .filter(Boolean)
    .join(" · ");
  return ogCard({
    title: name,
    subtitle,
    grid: storefront(awning, shopKind(name, r?.categories ?? [])),
  });
}
