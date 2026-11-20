import type { CSSProperties } from "react";
import { SPRITE_INFO, type SpriteName } from "@/lib/pixel/sprites";
import { cn } from "@/lib/utils";

/**
 * Animated sprite sheet. Frames are driven by CSS `steps()`; `scale` must be an integer
 * to keep edges sharp. With prefers-reduced-motion or the "Animations: off" toggle,
 * only the first frame is shown.
 */
export function Sprite({
  name,
  scale = 4,
  fps = 4,
  loop = true,
  still = false,
  label,
  className,
}: {
  name: SpriteName;
  scale?: number;
  fps?: number;
  loop?: boolean;
  /** Show only the first frame (decoration that has no job to do). */
  still?: boolean;
  label?: string;
  className?: string;
}) {
  const { frames, w, h } = SPRITE_INFO[name];
  const style = {
    width: w * scale,
    height: h * scale,
    backgroundImage: `url(/sprites/${name}.svg)`,
    backgroundSize: `${w * frames * scale}px ${h * scale}px`,
    "--frames": frames,
    "--dur": `${frames / fps}s`,
    "--sheet-w": `${-w * frames * scale}px`,
  } as CSSProperties;
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-once={!loop}
      data-still={still}
      className={cn("sprite", className)}
      style={style}
    />
  );
}

export type MascotMood = "idle" | "happy" | "sad";
const MOOD_SHEET: Record<MascotMood, SpriteName> = {
  idle: "mascot-idle",
  happy: "mascot-jump",
  sad: "mascot-sad",
};

/** Koki Meong, the Restoo mascot. */
export function Mascot({
  mood = "idle",
  scale = 8,
  still,
  label,
  className,
}: {
  mood?: MascotMood;
  scale?: number;
  still?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <Sprite
      name={MOOD_SHEET[mood]}
      scale={scale}
      fps={mood === "happy" ? 6 : 3}
      still={still}
      label={label}
      className={className}
    />
  );
}

export function BowlLogo({ scale = 3 }: { scale?: number }) {
  return <Sprite name="bowl-steam" scale={scale} fps={2} still />;
}
