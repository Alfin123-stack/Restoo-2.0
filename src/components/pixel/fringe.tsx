import { cn } from "@/lib/utils";

const COLS = 320;

/** Small seeded PRNG so the fringe is identical on server and client. */
function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Ragged pixel edge: irregular horizontal runs of 2-8 squares stepping up or down,
 * plus a few detached squares. Built as one <path>, so it stays crisp and tiny.
 */
function build(rows: number, seed: number) {
  const rand = rng(seed);
  const heights: number[] = [];
  let h = Math.max(2, Math.round(rows * 0.45));
  let x = 0;
  while (x < COLS) {
    const run = 2 + Math.floor(rand() * 7);
    const step = Math.round((rand() - 0.5) * 3);
    h = Math.min(rows - 2, Math.max(1, h + step));
    for (let i = 0; i < run && x < COLS; i++, x++) heights.push(h);
  }
  let body = "";
  let start = 0;
  for (let i = 1; i <= COLS; i++) {
    if (i === COLS || heights[i] !== heights[start]) {
      body += `M${start} ${rows - heights[start]!}h${i - start}v${heights[start]}h-${i - start}z`;
      start = i;
    }
  }
  let specks = "";
  const count = Math.round(COLS / 9);
  for (let i = 0; i < count; i++) {
    const cx = Math.floor(rand() * COLS);
    const top = rows - (heights[cx] ?? 0);
    const cy = Math.max(0, top - 1 - Math.floor(rand() * 3));
    specks += `M${cx} ${cy}h1v1h-1z`;
  }
  return { body, specks };
}

/**
 * Pixel transition between a scene and the page.
 * `edge="bottom"`: solid color rises from the bottom (use the page color to erode a scene above).
 * `edge="top"`: the same shape hangs from the top (use the page color to erode a band below).
 */
export function PixelFringe({
  fill = "var(--fringe)",
  speck,
  edge = "bottom",
  rows = 14,
  seed = 7,
  className,
}: {
  fill?: string;
  speck?: string;
  edge?: "top" | "bottom";
  rows?: number;
  seed?: number;
  className?: string;
}) {
  const { body, specks } = build(rows, seed);
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none w-full overflow-hidden", className)}
      style={{ aspectRatio: `${COLS} / ${rows}`, minHeight: 0 }}
    >
      <svg
        viewBox={`0 0 ${COLS} ${rows}`}
        shapeRendering="crispEdges"
        preserveAspectRatio="xMidYMid slice"
        className={cn(
          "absolute left-1/2 block h-full -translate-x-1/2",
          edge === "top" && "-scale-y-100",
        )}
        style={{ width: "max(100%, 720px)", height: "auto", aspectRatio: `${COLS} / ${rows}` }}
      >
        <path d={body} fill={fill} />
        <path d={specks} fill={speck ?? fill} />
      </svg>
    </div>
  );
}
