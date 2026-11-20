"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const COLS = 20;
const ROWS = 8;
const CELL_W = 40;
const CELL_H = 56;

// Words hidden horizontally: [row, startCol, word]
const WORDS: ReadonlyArray<readonly [number, number, string]> = [
  [1, 2, "RENDANG"],
  [3, 6, "NASIGORENG"],
  [5, 1, "SOTO"],
  [5, 9, "BAKSO"],
  [7, 11, "MIEAYAM"],
];

function build(): string[] {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const filler = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rows = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => filler[Math.floor(rand() * filler.length)]!),
  );
  for (const [r, c, w] of WORDS)
    for (let i = 0; i < w.length; i++) rows[r]![c + i] = w[i]!;
  return rows.map((r) => r.join(""));
}
const MATRIX = build();

/** Decorative letter field. Capsules draw around the hidden dishes when it scrolls into view. */
export function LetterGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: reduce ? 0 : 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const inWord = (r: number, c: number) =>
    WORDS.some(([wr, wc, w]) => wr === r && c >= wc && c < wc + w.length);

  return (
    <div ref={ref} className="hidden lg:block" aria-hidden="true">
      <div
        className="font-pixel relative mx-auto"
        style={{ width: COLS * CELL_W, height: ROWS * CELL_H }}
      >
        {MATRIX.map((row, r) =>
          [...row].map((ch, c) => (
            <span
              key={`${r}-${c}`}
              className={cn(
                "absolute flex items-center justify-center text-[26px] transition-colors duration-500",
                seen && inWord(r, c) ? "text-heading" : "text-terong-500/70",
              )}
              style={{ left: c * CELL_W, top: r * CELL_H, width: CELL_W, height: CELL_H }}
            >
              {ch}
            </span>
          )),
        )}
        <svg
          className="absolute inset-0"
          width={COLS * CELL_W}
          height={ROWS * CELL_H}
          fill="none"
        >
          {WORDS.map(([r, c, w], i) => (
            <rect
              key={w}
              x={c * CELL_W + 2}
              y={r * CELL_H + 8}
              width={w.length * CELL_W - 4}
              height={CELL_H - 16}
              rx={(CELL_H - 16) / 2}
              pathLength={1}
              stroke="var(--c-violet)"
              strokeOpacity="0.55"
              strokeWidth="2"
              strokeDasharray="1"
              strokeDashoffset={seen ? 0 : 1}
              style={{ transition: `stroke-dashoffset 900ms ease-out ${i * 350}ms` }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

/** Narrow screens: the same dishes as a compact row of outlined words. */
export function DishWords() {
  return (
    <ul
      className="font-pixel flex flex-wrap justify-center gap-2 text-lg lg:hidden"
      aria-label="Dishes"
    >
      {["RENDANG", "NASI GORENG", "SOTO", "BAKSO", "MIE AYAM"].map((w) => (
        <li key={w} className="text-heading border-sky/50 rounded-full border px-3 py-1">
          {w}
        </li>
      ))}
    </ul>
  );
}
