import Link from "next/link";
import { MotionToggle } from "./motion-toggle";
import { MusicToggle } from "./sound-toggle";
import { PixelFringe } from "@/components/pixel/fringe";

const cols = [
  {
    title: "Explore",
    links: [
      { href: "/restaurants", label: "Restaurants" },
      { href: "/foods", label: "Foods" },
      { href: "/gacha", label: "Gacha" },
      { href: "/favorites", label: "Favorites" },
    ],
  },
] as const;

const credit = "inline-block py-3 underline underline-offset-2 hover:text-krem";

/** Compact footer: link cluster, attributions, and a grassy pixel fringe. */
export function SiteFooter() {
  return (
    <footer className="mt-24">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-6 pb-10 md:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <p className="font-serif-mark text-heading text-[28px] leading-none">Restoo</p>
          <p className="text-terong-700 max-w-md">
            Find places to eat, read reviews, and save the ones you love. Your collections
            stay on this device and open even without internet.
          </p>
          <p className="text-terong-500 max-w-xl text-xs leading-6">
            Location data © OpenStreetMap contributors via{" "}
            <a className={credit} href="https://www.geoapify.com/">
              Geoapify
            </a>
            . Map by{" "}
            <a className={credit} href="https://openfreemap.org/">
              OpenFreeMap
            </a>
            . Food data from{" "}
            <a className={credit} href="https://www.themealdb.com/">
              TheMealDB
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col gap-6 md:items-end">
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="font-eyebrow text-terong-500 mb-2 text-xs">{c.title}</p>
              <ul className="flex flex-wrap gap-x-5 md:justify-end">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-terong-700 hover:text-krem inline-flex min-h-11 items-center"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="flex flex-wrap gap-3">
            <MotionToggle />
            <MusicToggle />
          </div>
        </div>
      </div>
      <div className="relative">
        <PixelFringe
          fill="var(--grass-2)"
          speck="var(--grass-1)"
          rows={12}
          seed={21}
          className="relative"
        />
        <p className="absolute inset-x-0 bottom-1 text-center text-xs font-medium text-[#0c2410] dark:text-[#eaf6ea]">
          Made for hungry people
        </p>
      </div>
    </footer>
  );
}
