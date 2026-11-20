/** Collection link: /favorites?n=Name&s=slug1,slug2 (no backend; the server only reads slugs). */
export const MAX_SHARE_ITEMS = 30;

export function buildShareUrl(origin: string, name: string, slugs: string[]): string {
  const params = new URLSearchParams();
  params.set("n", name.slice(0, 40));
  params.set("s", slugs.slice(0, MAX_SHARE_ITEMS).join(","));
  return `${origin}/favorites?${params.toString()}`;
}

export function parseShared(sp: {
  s?: string | string[];
  n?: string | string[];
}): { name: string; slugs: string[] } | null {
  const raw = Array.isArray(sp.s) ? sp.s[0] : sp.s;
  if (!raw) return null;
  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]{1,100}$/.test(s))
    .slice(0, MAX_SHARE_ITEMS);
  if (slugs.length === 0) return null;
  const name =
    (Array.isArray(sp.n) ? sp.n[0] : sp.n)?.trim().slice(0, 40) ||
    "A friend's collection";
  return { name, slugs };
}

/** Uses the Web Share API when available, otherwise copies to the clipboard. Returns which one was used. */
export async function shareLink(
  url: string,
  title: string,
): Promise<"shared" | "copied" | "failed"> {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share({ title, url });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "failed";
    try {
      await navigator.clipboard.writeText(url);
      return "copied";
    } catch {
      return "failed";
    }
  }
}
