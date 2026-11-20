import type { ReactNode } from "react";
import { PixelArt } from "@/components/pixel/pixel-art";
import { Mascot, type MascotMood } from "@/components/pixel/sprite";
import { storefront, type ShopKind } from "@/lib/pixel/storefront";

export function EmptyState({
  title,
  description,
  action,
  mood = "idle",
  shop,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  mood?: MascotMood;
  /** Show a little shop next to the mascot. */
  shop?: ShopKind;
}) {
  return (
    <div className="px-box mx-auto max-w-2xl px-6 py-10 text-center [--px-bg:linear-gradient(to_bottom,var(--color-kartu)_55%,color-mix(in_srgb,var(--color-kunyit-400)_32%,var(--color-kartu)))]">
      <div className="flex flex-col items-center">
        <div className="flex items-end justify-center gap-4">
          {shop ? (
            <PixelArt grid={storefront("p", shop)} size={4} className="opacity-90" />
          ) : null}
          <Mascot mood={mood} scale={6} />
        </div>
        {/* Bayangan di tanah, dua langkah pixel */}
        <span className="mt-1 block h-1 w-20 bg-black/20" />
        <span className="block h-1 w-12 bg-black/10" />
      </div>
      <h2 className="mt-4 text-2xl sm:text-3xl">{title}</h2>
      {description ? (
        <p className="text-terong-700 mx-auto mt-3 max-w-md">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-6 flex flex-wrap justify-center gap-4">{action}</div>
      ) : null}
    </div>
  );
}

export function ErrorNotice({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div
      role="alert"
      className="px-box flex items-start gap-4 p-4 [--px-bg:var(--c-errbg)] [--px-ink:var(--color-cabai-700)]"
    >
      <Mascot mood="sad" scale={4} />
      <div>
        <p className="font-display text-cabai-700 text-xl">{title}</p>
        {description ? (
          <p className="text-terong-700 mt-1 text-sm">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
