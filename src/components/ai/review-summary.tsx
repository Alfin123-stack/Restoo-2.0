import { PixelIcon } from "@/components/pixel/pixel-art";
import { getReviewSummary } from "@/lib/ai/review-summary";

/** "What people say": short summary above the reviews. Renders nothing until there are 3+ reviews. */
export async function ReviewSummaryCard({ restaurantId }: { restaurantId: string }) {
  const summary = await getReviewSummary(restaurantId).catch(() => null);
  if (!summary) return null;

  return (
    <section
      aria-label="What people say"
      className="px-box mb-8 space-y-4 p-5 [--px-bg:var(--color-pandan-100)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-eyebrow text-xs uppercase">What people say</h3>
        <span className="font-eyebrow text-terong-700 text-xs uppercase">
          {summary.source === "ai" ? "AI summary" : "Quick summary"} · {summary.basedOn}{" "}
          reviews
        </span>
      </div>
      <p className="text-lg">{summary.headline}</p>
      {summary.pros.length || summary.cons.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {summary.pros.length ? (
            <ul className="space-y-1">
              {summary.pros.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <PixelIcon name="check" size={2} /> {p}
                </li>
              ))}
            </ul>
          ) : null}
          {summary.cons.length ? (
            <ul className="space-y-1">
              {summary.cons.map((c) => (
                <li key={c} className="text-terong-700 flex items-center gap-2">
                  <PixelIcon name="alert" size={2} /> {c}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
