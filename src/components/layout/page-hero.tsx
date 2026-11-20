import { cn } from "@/lib/utils";

/**
 * Inner-page header on the paper canvas: optional mono eyebrow, a regular-weight title and a
 * muted intro. Content below can overlap with `-mt-6 relative z-10` when it should sit close.
 */
export function PageHero({
  eyebrow,
  title,
  children,
  narrow = false,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <section className="border-edge border-b">
      <div
        className={cn(
          "mx-auto px-4 pt-12 pb-10 sm:px-6",
          narrow ? "max-w-3xl" : "max-w-6xl",
        )}
      >
        {eyebrow ? <p className="font-eyebrow text-terong-500 text-xs">{eyebrow}</p> : null}
        <h1
          className={cn(
            eyebrow && "mt-3",
            "text-[clamp(2rem,4vw+0.75rem,2.875rem)] leading-[1.1] text-balance",
          )}
        >
          {title}
        </h1>
        {children ? (
          <div className="text-terong-700 mt-4 max-w-xl text-base leading-[1.4]">{children}</div>
        ) : null}
      </div>
    </section>
  );
}
