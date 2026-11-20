"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/**
 * Photo drawn on a tiny canvas, reduced to a few colour levels with ordered dithering, then scaled up crisp.
 * The normal <img> stays underneath, so it still works before hydration, without canvas, or if drawing fails.
 * Fills the nearest positioned parent.
 */
export function PixelPhoto({
  src,
  sizes,
  cols = 56,
  fit = "cover",
  levels = 6,
  className,
}: {
  src: string;
  sizes: string;
  cols?: number;
  fit?: "cover" | "contain";
  levels?: number;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    const img = c?.parentElement?.querySelector("img");
    if (!c || !img) return;
    const paint = () => {
      try {
        const box = c.getBoundingClientRect();
        if (!img.naturalWidth || !box.width) return;
        const w = cols;
        const h = Math.max(1, Math.round((cols * box.height) / box.width));
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.imageSmoothingQuality = "high";
        const pick = fit === "cover" ? Math.max : Math.min;
        const s = pick(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * s;
        const dh = img.naturalHeight * s;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        const data = ctx.getImageData(0, 0, w, h);
        const px = data.data;
        const step = 255 / (levels - 1);
        for (let i = 0; i < px.length; i += 4) {
          const p = i / 4;
          const t =
            (BAYER[((p % w) % 4) + 4 * (Math.floor(p / w) % 4)]! / 16 - 0.5) * step * 0.6;
          for (let k = 0; k < 3; k++) {
            const v = Math.min(255, Math.max(0, px[i + k]! + t));
            px[i + k] = Math.round(v / step) * step;
          }
        }
        ctx.putImageData(data, 0, 0);
        setReady(true);
      } catch {
        /* keep the normal image */
      }
    };
    if (img.complete) paint();
    img.addEventListener("load", paint);
    return () => img.removeEventListener("load", paint);
  }, [src, cols, fit, levels]);

  return (
    <span className="absolute inset-0 block">
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className={cn(fit === "cover" ? "object-cover" : "object-contain", className)}
      />
      <canvas
        ref={canvas}
        aria-hidden="true"
        className={cn(
          "pixelated absolute inset-0 size-full transition-opacity",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}
