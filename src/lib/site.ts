export const SITE_NAME = "Restoo";
export const SITE_DESCRIPTION =
  "Find places to eat, read reviews, and save your favorite restaurants. Works offline too.";
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

if (process.env.NODE_ENV === "production" && SITE_URL.includes("localhost")) {
  // Canonical URLs, sitemap and OG tags would point at localhost. Set SITE_URL in the host's env.
  console.warn("[seo] SITE_URL is not set: canonical URLs and the sitemap use localhost.");
}
