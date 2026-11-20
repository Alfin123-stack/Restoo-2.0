import { ImageResponse } from "next/og";
import { gridToRects } from "@/lib/pixel/art";
import type { Grid } from "@/lib/pixel/art";
import { SITE_NAME } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
const CELL = 20;

/** 1200x630 share card: dark Pasar Malam background, pixel building on the right, text on the left. */
export function ogCard({
  title,
  subtitle,
  grid,
}: {
  title: string;
  subtitle?: string;
  grid: Grid;
}) {
  const rects = gridToRects(grid);
  const w = grid[0]!.length * CELL;
  const h = grid.length * CELL;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 64px",
          background: "#1c1240",
          color: "#fff6e0",
          borderBottom: "16px solid #ffd23f",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
          <div style={{ fontSize: 32, color: "#ffd23f", letterSpacing: 2 }}>{SITE_NAME}</div>
          <div
            style={{
              fontSize: title.length > 28 ? 60 : 76,
              fontWeight: 800,
              lineHeight: 1.05,
              marginTop: 20,
            }}
          >
            {title.slice(0, 60)}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 30, marginTop: 24, color: "#cdbfff" }}>
              {subtitle.slice(0, 80)}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", position: "relative", width: w, height: h }}>
          {rects.map((r, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: r.x * CELL,
                top: r.y * CELL,
                width: r.w * CELL,
                height: CELL,
                background: r.fill,
              }}
            />
          ))}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
