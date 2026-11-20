import type { ReactNode } from "react";
import { PixelStars } from "@/components/pixel/pixel-art";
import { cn } from "@/lib/utils";

const AVATAR_BG = [
  "var(--color-kunyit-400)",
  "var(--color-langit-300)",
  "var(--color-pandan-500)",
  "#ff9fb2",
  "#f08a24",
];

function avatarColor(name: string) {
  let sum = 0;
  for (const ch of name) sum += ch.codePointAt(0) ?? 0;
  return AVATAR_BG[sum % AVATAR_BG.length]!;
}

/** RPG-style dialog box: avatar on the left, "NPC name" on a yellow plate. Used for reviews. */
export function DialogBox({
  name,
  rating,
  date,
  children,
  className,
}: {
  name: string;
  rating?: number;
  date?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-4", className)}>
      <div
        aria-hidden="true"
        className="px-flat font-display flex size-14 shrink-0 items-center justify-center text-2xl"
        style={{ ["--px-bg" as string]: avatarColor(name) }}
      >
        {name.trim().charAt(0).toUpperCase()}
      </div>
      <div className="px-box relative min-w-0 flex-1 p-4 [--px-bg:var(--color-kartu)]">
        {/* Ekor bubble bergaya pixel */}
        <span
          aria-hidden="true"
          className="bg-terong-900 absolute top-5 -left-6 h-4 w-4"
        />
        <span
          aria-hidden="true"
          className="absolute top-6 -left-4 h-2 w-4 bg-[var(--px-bg)]"
        />
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="px-flat font-eyebrow -mt-9 inline-block max-w-full truncate px-3 py-0.5 text-xs uppercase [--px-bg:var(--color-kunyit-400)] [--px:2px]">
            {name}
          </p>
          {typeof rating === "number" ? <PixelStars value={rating} /> : null}
        </div>
        <div className="text-krem break-words">{children}</div>
        {date ? (
          <p className="font-eyebrow text-terong-500 mt-3 text-xs uppercase">{date}</p>
        ) : null}
      </div>
    </div>
  );
}
