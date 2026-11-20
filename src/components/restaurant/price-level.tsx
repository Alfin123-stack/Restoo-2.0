import { CoinIcon } from "@/components/pixel/pixel-art";
import { PRICE_LABEL } from "@/lib/constants";

export function PriceLevel({ level }: { level: 1 | 2 | 3 | null }) {
  if (!level) return null;
  return (
    <span
      role="img"
      aria-label={`Price: ${PRICE_LABEL[level]?.toLowerCase()}`}
      className="inline-flex items-center gap-0.5"
    >
      {Array.from({ length: level }, (_, i) => (
        <CoinIcon key={i} size={2} />
      ))}
    </span>
  );
}
