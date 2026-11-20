import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getAllRestaurantSlugs } from "@/lib/repositories/restaurants";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/restaurants",
    "/foods",
    "/gacha",
  ].map((path) => ({ url: `${SITE_URL}${path}`, lastModified: now }));

  let slugs: { slug: string; updatedAt: string }[] = [];
  try {
    slugs = await getAllRestaurantSlugs();
  } catch (error) {
    console.error("Sitemap: failed to read the database", error);
  }
  return [
    ...staticRoutes,
    ...slugs.map(({ slug, updatedAt }) => ({
      url: `${SITE_URL}/restaurants/${slug}`,
      lastModified: updatedAt,
    })),
  ];
}
