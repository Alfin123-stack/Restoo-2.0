# 🍜 Restoo

_A pixel-flavoured restaurant discovery app built with **Next.js 16**. Find a place that is open right now, spin the gacha when you cannot decide, and keep your favorites even without internet._

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-skyblue?logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-darkgreen?logo=mongodb&logoColor=white)
![MapLibre](https://img.shields.io/badge/MapLibre-5-396cb2?logo=maplibre&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-offline_ready-5a0fc8?logo=pwa&logoColor=white)

---

## 📖 Overview

**Restoo** helps you decide where to eat. Search and filter restaurants, see what is open at this moment, browse them on a map, read and write reviews, and save the places you love. Food inspiration and recipes sit next to the restaurant list for the days you would rather cook.

The look is a **"pastoral machinery"** design system: a warm paper canvas, quiet machined panels and tactile keys, with saturated pixel art kept for illustrations (the hero scene, the mascot Meong, restaurant storefronts and food sprites). It comes in a light day theme and a dark night theme of the same scene.

---

## ✨ Features

- 🔎 **Search and filters** → open now, price, minimum rating, features (halal, Wi-Fi, outdoor seating…) and sorting, all kept in the URL so results can be shared.
- 🗺️ **Map view** → MapLibre map with numbered clusters that split as you zoom, plus pixel-style popups for each place.
- 📍 **Near me** → distance-based results using geolocation and a MongoDB `$geoNear` query.
- 🕒 **Open / Closed** → computed live from opening hours (OpenStreetMap format or plain text).
- 🎲 **Gacha** → a random restaurant, filtered by city, type and "open only". Add a mood and see why it was picked.
- 🖼️ **Photo carousel** → restaurant pages show a cover plus extra photos with arrows, dots, swipe and auto-advance (pauses on hover, focus or reduced motion).
- ⭐ **Reviews without login** → protected by Zod validation, HTML sanitizing, a honeypot and a rate limit.
- 💾 **Favorites and collections** → stored on the device in IndexedDB, synced between tabs, usable offline, shareable by link.
- 📦 **Move to another device** → save a copy of your favorites to a file and open it elsewhere.
- 🍲 **Foods** → recipes from TheMealDB with category browsing and a recipe video popup.
- 🐱 **Ask Meong (optional AI)** → type a sentence like _"cheap halal place open now"_ and it becomes search filters. Also review summaries, photo search and mood gacha. Everything still works in keyword mode without a key.
- 📱 **Installable PWA** → app shell, visited pages and favorites keep working offline.
- 🌗 **Light and dark themes** → follows the system setting, switchable from the header.
- 🔊 **Optional sound** → soft wooden taps, kalimba-like plucks and a slow ambient loop, generated in code. **Off by default.**
- ♿ **Accessible by default** → 44px touch targets, visible focus, reduced-motion support and an animations switch in the footer.

---

## 🏗 Tech Stack

**Frontend**

- Next.js 16 (App Router, Cache Components, typed routes)
- React 19, TypeScript (strict)
- Tailwind CSS 4 with a custom pixel design system
- MapLibre GL + OpenFreeMap (vector tiles, no API key)
- Self-hosted fonts: Inter, IBM Plex Mono, Instrument Serif, Departure Mono

**Backend and data**

- MongoDB Atlas + Mongoose
- Server Actions + Zod + sanitize-html + a MongoDB-backed rate limit (TTL index)
- Restaurants: Geoapify Places, seeded into MongoDB
- Foods: TheMealDB (cached with `use cache`)
- Google Gemini (optional) for the AI features

**Offline and tooling**

- Serwist service worker (`@serwist/turbopack`) and IndexedDB (`idb`)
- ESLint, Prettier, Husky, lint-staged

---

## ⚡ Getting Started

### ✅ Prerequisites

- Node.js `>= 20.9`
- A MongoDB Atlas cluster (the free tier is enough)
- _Optional:_ a Geoapify key (real restaurant data), a Google AI Studio key (AI features)

### 📥 Installation

```bash
git clone https://github.com/Alfin123-stack/restoo.git
cd restoo
npm install
cp .env.example .env.local     # then fill in MONGODB_URI
npm run seed:indexes           # create the MongoDB indexes
npm run seed:demo              # 6 fictional restaurants to try the app
npm run dev
```

Open <http://localhost:3000>.

### 🔐 Environment variables

| Variable                                   | Required | Purpose                                                          |
| ------------------------------------------ | :------: | ---------------------------------------------------------------- |
| `MONGODB_URI`                              |    ✅    | MongoDB Atlas connection string (use a `readWrite` user)         |
| `MONGODB_DB`                               |    ✅    | Database name, e.g. `restoo`                                     |
| `SITE_URL`                                 |    ✅    | Public site URL, used for sitemap, robots and Open Graph         |
| `GEOAPIFY_API_KEY`                         |    ➖    | Only used by `npm run seed:fetch`, never read at runtime         |
| `MEALDB_API_KEY`                           |    ➖    | TheMealDB supporter key. Empty uses the test key `1`             |
| `GEMINI_API_KEY`                           |    ➖    | Turns on the AI features. Empty keeps keyword mode               |
| `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`    |    ➖    | Defaults to `gemini-flash-latest` and `gemini-flash-lite-latest` |
| `AI_ASK_RATE_LIMIT`, `AI_PHOTO_RATE_LIMIT` |    ➖    | Per-visitor, per-hour limits (defaults 30 and 10)                |
| `REVIEW_RATE_LIMIT`                        |    ➖    | Reviews per hashed IP per hour (default 3)                       |

> Never commit `.env.local`. Every key above is read on the server only, and nothing uses `NEXT_PUBLIC_`.

### 🌍 Using real restaurant data

1. Put your Geoapify key in `.env.local` as `GEOAPIFY_API_KEY`.
2. Fetch a city (saved to `data/seed/raw-<city>.json`):
   ```bash
   npm run seed:fetch -- --city "Jakarta"
   ```
3. Load it into MongoDB (safe to repeat):
   ```bash
   npm run seed
   ```
4. Optionally add photos, descriptions and menus in `data/seed/overrides.json`, keyed by the Geoapify `place_id`, then run `npm run seed` again:
   ```json
   {
     "PLACE_ID_FROM_SNAPSHOT": {
       "description": "A legendary soto stall since 1990.",
       "pictureUrl": "https://example.com/cover.jpg",
       "pictureUrls": ["https://example.com/extra-1.jpg"],
       "menus": { "foods": ["Soto ayam"], "drinks": ["Es teh"] }
     }
   }
   ```
5. _Optional:_ add tags with AI. `npm run seed:tags -- --dry` previews, without `--dry` it writes.

To start over with another city, run `npm run seed:clear` to see what would be removed, then `npm run seed:clear -- --yes` to delete restaurants and reviews.

OpenStreetMap and Geoapify do not provide photos, ratings or menus. Ratings come from reviews written in the app. Places without a photo get a generated pixel storefront. Only use photos you own or are licensed to use, and add the image host to `images.remotePatterns` in `next.config.ts`.

### 🧰 Scripts

| Command                                       | Purpose                                                   |
| --------------------------------------------- | --------------------------------------------------------- |
| `npm run dev`                                 | Development server                                        |
| `npm run build` / `npm start`                 | Production build and server                               |
| `npm run lint` / `typecheck` / `format:check` | Code quality                                              |
| `npm run sprites`                             | Rebuild the SVG sprite sheets from `src/lib/pixel/art.ts` |
| `npm run seed:indexes`                        | Create or sync the MongoDB indexes                        |
| `npm run seed` / `seed:demo`                  | Load real or demo data                                    |
| `npm run seed:fetch` / `seed:tags`            | Fetch from Geoapify / enrich tags                         |
| `npm run seed:clear`                          | Remove restaurants and reviews (needs `--yes`)            |

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── (site)/            # /, /restaurants, /restaurants/[slug], /foods, /foods/[id], /favorites, /gacha, /~offline
│   ├── serwist/           # serves the service worker
│   └── sw.ts, manifest.ts, sitemap.ts, robots.ts, opengraph-image.tsx
├── actions/               # Server Actions: reviews, gacha, AI, recommendations
├── components/            # pixel (sprites, icons), ui, layout, landing, restaurant, map, food, ai
├── features/              # favorites, collections, backup (IndexedDB)
├── lib/
│   ├── db/                # connection, Mongoose models, DTO serializers
│   ├── repositories/      # queries with 'use cache' + cacheTag
│   ├── ai/                # Gemini client, moderation, keyword fallback
│   ├── api/mealdb.ts      # TheMealDB client + Zod
│   ├── audio/             # Web Audio sound and music
│   └── pixel/             # pixel art sources and generators
└── styles/                # pixel.css, scene.css
scripts/seed/              # Geoapify fetch, idempotent seed, indexes, clear, tag enrichment
```

**Key decisions**

- Data is fetched on the server and cached with `use cache` + `cacheTag`. A new review refreshes the cache immediately. Cached functions return plain objects (DTOs), not Mongoose documents.
- Data-driven parts are wrapped in `<Suspense>`, so `next build` needs neither a database nor internet.
- The service worker is disabled in `next dev`. Test the PWA with `npm run build && npm start`.
- Public reviews are protected by Zod, sanitizing, a honeypot and a rate limit. For heavy traffic consider adding login or moderation.

---

## 🎨 Design System

- **Canvas and panels:** warm paper background, pale raised panels with a machined-frame shadow, tactile "physical key" buttons.
- **Pixel art:** used for illustrations, the pixel photo effect on food images, map popups and card hover states.
- **Themes:** `data-theme` on `<html>`, saved in `localStorage`, following the system preference by default. Tailwind's `dark:` variant follows the same switch.
- **Motion:** scroll reveal, stepped pixel loaders and route progress bar. All of it respects `prefers-reduced-motion` and the footer animations switch.
- **Tokens:** defined in `src/app/globals.css`, with pixel utilities in `src/styles/pixel.css`.

---

## 🚀 Deploy (Vercel + Atlas)

1. Create an Atlas cluster and a database user with `readWrite` on one database.
2. In Network Access allow `0.0.0.0/0` (Vercel IPs change), so use a strong, unique password.
3. Set `MONGODB_URI`, `MONGODB_DB` and `SITE_URL` (plus any optional keys) as environment variables.
4. From your computer, run `npm run seed:indexes` and `npm run seed` against the production database.
5. Deploy with the Node.js runtime (`use cache` does not support Edge).

Before going public: rotate any key that was ever shared in chat or screenshots, and check the terms of Geoapify and TheMealDB. The TheMealDB test key is meant for development and personal projects.

---

## 🙏 Credits

- Restaurant data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors via [Geoapify](https://www.geoapify.com/)
- Map tiles by [OpenFreeMap](https://openfreemap.org/) and [OpenMapTiles](https://openmaptiles.org/)
- Recipes from [TheMealDB](https://www.themealdb.com/)
- Fonts: Inter, IBM Plex Mono, Instrument Serif and Departure Mono (SIL OFL)

---

## 👤 Author

Built by **Sdf** · [GitHub @Alfin123-stack](https://github.com/Alfin123-stack)
