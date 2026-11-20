"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { bindVisibility, sfx, soundStore, syncMusic } from "@/lib/audio/sound";

/** Mounted once. Soft click sound on buttons and links (only when sound is on), silent on reading pages. */
export function SoundEffects() {
  const pathname = usePathname();
  const quiet = /^\/(restaurants|foods)\/./.test(pathname);

  useEffect(() => {
    const unbind = bindVisibility();
    syncMusic();
    return unbind;
  }, []);

  useEffect(() => {
    if (quiet) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest("button, a[href]");
      if (el && !el.hasAttribute("data-nosound") && soundStore.isOn()) sfx("click");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [quiet]);

  return null;
}
