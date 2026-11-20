import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "pandan" | "open" | "kunyit" | "cabai" | "langit" | "krem";

const tones: Record<Tone, string> = {
  pandan: "[--px-bg:var(--color-pandan-100)] text-pandan-700",
  open: "[--px-bg:var(--color-pandan-500)] text-terong-900",
  kunyit: "[--px-bg:var(--color-kunyit-400)] text-terong-900",
  cabai: "[--px-bg:var(--color-cabai-600)] text-terong-900",
  langit: "[--px-bg:var(--color-langit-100)] text-krem",
  krem: "[--px-bg:var(--color-kartu)] text-krem",
};

/** Small game-style label with a 2px frame. */
export function Badge({
  tone = "pandan",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "px-flat font-label inline-flex items-center gap-1 px-2.5 py-0.5 text-xs leading-5",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
