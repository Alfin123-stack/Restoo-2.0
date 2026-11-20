"use client";

import { useSyncExternalStore } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { soundStore } from "@/lib/audio/sound";
import { cn } from "@/lib/utils";

const useSound = () =>
  useSyncExternalStore(soundStore.subscribe, soundStore.isOn, soundStore.server);
const useMusic = () =>
  useSyncExternalStore(soundStore.subscribe, soundStore.isMusicOn, soundStore.server);

/** Sound switch for the navbar. Off by default; remembers the choice on this device. */
export function SoundToggle() {
  const on = useSound();
  return (
    <button
      type="button"
      data-nosound
      aria-pressed={on}
      aria-label="Sound"
      title={`Sound is ${on ? "on" : "off"}. Click to turn ${on ? "off" : "on"}.`}
      onClick={() => soundStore.setSound(!on)}
      className={cn(
        "px-box px-press flex min-h-11 w-11 items-center justify-center",
        on ? "[--px-bg:var(--color-pandan-500)]" : "[--px-bg:var(--color-kartu)]",
      )}
    >
      <PixelIcon name={on ? "sound" : "mute"} size={2} />
    </button>
  );
}

/** Background music switch (footer). Only usable once sound is on. */
export function MusicToggle() {
  const sound = useSound();
  const music = useMusic();
  return (
    <button
      type="button"
      data-nosound
      aria-pressed={music}
      disabled={!sound}
      onClick={() => soundStore.setMusic(!music)}
      className={cn(
        "px-box px-press font-label min-h-11 px-4 text-[13px] tracking-wider uppercase disabled:opacity-50",
        music ? "[--px-bg:var(--color-pandan-500)]" : "[--px-bg:var(--color-kartu)]",
      )}
    >
      Music: {music ? "on" : "off"}
    </button>
  );
}
