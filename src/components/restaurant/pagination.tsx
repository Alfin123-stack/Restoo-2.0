import Link from "next/link";
import type { Route } from "next";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  params,
  basePath,
}: {
  page: number;
  pageCount: number;
  params: Record<string, string | undefined>;
  basePath: string;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) qs.set(key, value);
    if (target > 1) qs.set("page", String(target));
    const query = qs.toString();
    return (query ? `${basePath}?${query}` : basePath) as Route;
  };

  const item =
    "px-box px-press font-label inline-flex min-h-12 items-center gap-2 px-5 text-[13px] uppercase tracking-wider";

  return (
    <nav
      aria-label="Pagination"
      className="mt-14 flex flex-wrap items-center justify-center gap-6"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          rel="prev"
          className={cn(item, "[--px-bg:var(--color-kartu)]")}
        >
          <PixelIcon name="back" size={2} />
          Previous
        </Link>
      ) : null}
      <span className="font-eyebrow text-xs uppercase" aria-current="page">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link
          href={href(page + 1)}
          rel="next"
          className={cn(item, "[--px-bg:var(--color-kunyit-400)]")}
        >
          Next
          <PixelIcon name="play" size={2} />
        </Link>
      ) : null}
    </nav>
  );
}
