/** Membuat slug URL-friendly dari teks bebas (aman untuk nama berbahasa Indonesia). */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Menjamin slug unik dengan menambahkan akhiran -2, -3, ... bila sudah terpakai. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "restaurant";
  let candidate = root;
  let i = 2;
  while (taken.has(candidate)) candidate = `${root}-${i++}`;
  taken.add(candidate);
  return candidate;
}
