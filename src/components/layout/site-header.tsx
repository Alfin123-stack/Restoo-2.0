"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { BowlLogo } from "@/components/pixel/sprite";
import { MotionToggle } from "./motion-toggle";
import { SoundToggle } from "./sound-toggle";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/restaurants", label: "Restaurants" },
  { href: "/foods", label: "Foods" },
  { href: "/gacha", label: "Gacha" },
  { href: "/favorites", label: "Favorites" },
] as const;

const shell =
  "site-header group/h sticky top-0 z-40 transition-colors duration-200 data-[tone=paper]:border-b data-[tone=paper]:border-edge data-[tone=paper]:bg-[var(--header-bg)] data-[tone=paper]:backdrop-blur-md";

function Logo() {
  return (
    <Link
      href="/"
      className="text-heading flex min-h-11 min-w-11 items-center gap-2 group-data-[tone=art]/h:text-white"
      aria-label="Restoo, go to home"
    >
      <BowlLogo scale={2} />
      <span className="font-serif-mark text-[28px] leading-none max-[359px]:sr-only">
        Restoo
      </span>
    </Link>
  );
}

export function HeaderFallback() {
  return (
    <header className={shell} data-tone="paper">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center px-5">
        <Logo />
      </div>
    </header>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  // The panel is only open for the path it was opened on, so it closes automatically on navigation.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [overArt, setOverArt] = useState(false);

  // On the landing page the header floats over the pixel scene until the scene scrolls away.
  useEffect(() => {
    if (pathname !== "/") return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      setOverArt(!!hero && hero.getBoundingClientRect().bottom > 68);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenFor(null);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const tone = pathname === "/" && overArt && !open ? "art" : "paper";

  return (
    <header className={shell} data-tone={tone}>
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-3 lg:flex">
          <ul className="flex items-center gap-1 rounded-xl p-1 group-data-[tone=art]/h:bg-white/15 group-data-[tone=art]/h:backdrop-blur-md">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={cn(
                    "font-label inline-flex min-h-11 items-center rounded-lg px-3.5 text-[15px] transition-colors",
                    "text-terong-700 hover:text-krem group-data-[tone=art]/h:text-white/90 group-data-[tone=art]/h:hover:text-white",
                    isActive(href) &&
                      "bg-panel text-krem group-data-[tone=art]/h:bg-white/25 group-data-[tone=art]/h:text-white",
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <MotionToggle iconOnly />
          <SoundToggle />
          <ThemeToggle />
          <Link
            href="/restaurants"
            className={cn("btn", tone === "art" ? "btn-light" : "btn-dark")}
          >
            Find food
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
          <SoundToggle />
          <ThemeToggle />
          <button
            ref={buttonRef}
            type="button"
            className="px-box px-press flex size-11 items-center justify-center [--px-bg:var(--color-kartu)]"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpenFor(open ? null : pathname)}
          >
            <PixelIcon name={open ? "close" : "menu"} size={2} />
          </button>
        </div>
      </div>

      <nav
        id={panelId}
        aria-label="Mobile navigation"
        hidden={!open}
        className="border-edge bg-canvas border-t px-5 py-5 lg:hidden"
      >
        <ul className="space-y-2">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "font-label flex min-h-12 items-center rounded-lg px-4 text-base",
                  isActive(href) ? "bg-panel text-krem" : "text-terong-700",
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-3">
          <Link href="/restaurants" className="btn btn-dark flex-1">
            Find food
          </Link>
          <MotionToggle compact />
        </div>
      </nav>
    </header>
  );
}
