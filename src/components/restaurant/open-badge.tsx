import { Badge } from "@/components/ui/badge";
import { getOpenStatus } from "@/lib/opening-hours";

/** OPEN / CLOSED sign. Computed per request in the Asia/Jakarta time zone. */
export function OpenBadge({
  openingHours,
  showLabel = false,
}: {
  openingHours: string | null;
  showLabel?: boolean;
}) {
  const status = getOpenStatus(openingHours);
  if (status.state === "unknown") return null;
  const open = status.state === "open";
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Badge tone={open ? "open" : "krem"}>{open ? "Open" : "Closed"}</Badge>
      {showLabel ? <span className="text-terong-700 text-sm">{status.label}</span> : null}
    </span>
  );
}
