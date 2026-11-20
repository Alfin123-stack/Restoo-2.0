import Image from "next/image";
import { PixelArt } from "@/components/pixel/pixel-art";
import { STOREFRONT_AWNINGS, shopKind, storefront } from "@/lib/pixel/storefront";
import { cn } from "@/lib/utils";

function awningFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return STOREFRONT_AWNINGS[h % STOREFRONT_AWNINGS.length]!;
}

/** Restaurant photo; when missing, shows a pixel warung storefront with an awning picked from the name. */
export function RestaurantImage({
  src,
  name,
  categories,
  sizes,
  priority,
  className,
}: {
  src: string | null;
  name: string;
  categories?: string[];
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`Photo of ${name}`}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex size-full items-end justify-center overflow-hidden",
        className,
      )}
      style={{
        background:
          "linear-gradient(var(--sky-2) 0 40%, var(--sky-3) 40% 64%, var(--sky-4) 64% 100%)",
      }}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-[16%]"
        style={{
          background:
            "linear-gradient(var(--grass-1) 0 55%, var(--grass-2) 55% 100%)",
        }}
      />
      <PixelArt
        grid={storefront(awningFor(name), shopKind(name, categories))}
        size={8}
        className="relative mb-[6%] h-[66%] w-auto max-w-[92%]"
      />
    </div>
  );
}
