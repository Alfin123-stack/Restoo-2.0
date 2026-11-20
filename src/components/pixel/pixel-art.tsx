import {
  FOODS,
  HEART,
  HEART_EMPTY,
  ICONS,
  PLATE,
  STAR,
  STAR_EMPTY,
  COIN,
  gridToRects,
} from "@/lib/pixel/art";
import type { FoodName, Grid, IconName } from "@/lib/pixel/art";
import { cn } from "@/lib/utils";

/** Draws a pixel grid as a crisp SVG. `size` = width of one pixel in screen px (use integers). */
export function PixelArt({
  grid,
  size = 4,
  label,
  className,
}: {
  grid: Grid;
  size?: number;
  label?: string;
  className?: string;
}) {
  const w = Math.max(...grid.map((r) => r.length));
  const h = grid.length;
  return (
    <svg
      width={w * size}
      height={h * size}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={cn("shrink-0", className)}
    >
      {gridToRects(grid, 0, undefined, true).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}

export function PixelIcon({
  name,
  size = 3,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return <PixelArt grid={ICONS[name]} size={size} className={className} />;
}

export function PixelHeart({
  filled = true,
  size = 3,
  className,
}: {
  filled?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <PixelArt grid={filled ? HEART : HEART_EMPTY} size={size} className={className} />
  );
}

export function PixelStar({
  filled = true,
  size = 2,
}: {
  filled?: boolean;
  size?: number;
}) {
  return <PixelArt grid={filled ? STAR : STAR_EMPTY} size={size} />;
}

/** 1-5 rating stars (rounded to the nearest star). */
export function PixelStars({
  value,
  size = 2,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const full = Math.round(value);
  return (
    <span
      role="img"
      aria-label={label ?? `Rating ${value} out of 5`}
      className="inline-flex items-center gap-0.5"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <PixelStar key={i} filled={i < full} size={size} />
      ))}
    </span>
  );
}

export function FoodIcon({
  name,
  size = 4,
  label,
  className,
}: {
  name: FoodName;
  size?: number;
  label?: string;
  className?: string;
}) {
  return <PixelArt grid={FOODS[name]} size={size} label={label} className={className} />;
}

export function PlateIcon({
  size = 6,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return <PixelArt grid={PLATE} size={size} className={className} />;
}

export function CoinIcon({ size = 3 }: { size?: number }) {
  return <PixelArt grid={COIN} size={size} />;
}
