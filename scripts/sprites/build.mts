/**
 * Menghasilkan sprite sheet SVG (satu baris frame) ke public/sprites/ dari src/lib/pixel/art.ts.
 *   npm run sprites
 * Ubah gambar di art.ts, jalankan perintah ini, lalu commit hasilnya.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { SHEETS, gridToRects, validate } from "../../src/lib/pixel/art.ts";

await mkdir("public/sprites", { recursive: true });

for (const [name, { frames }] of Object.entries(SHEETS)) {
  const w = frames[0]![0]!.length;
  const h = frames[0]!.length;
  const rects = frames.flatMap((frame, i) =>
    gridToRects(validate(`${name}#${i}`, frame), i * w),
  );
  const body = rects
    .map(
      (r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="1" fill="${r.fill}"/>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * frames.length}" height="${h}" viewBox="0 0 ${w * frames.length} ${h}" shape-rendering="crispEdges">${body}</svg>\n`;
  await writeFile(`public/sprites/${name}.svg`, svg);
  console.log(`${name}.svg  ${frames.length} frame ${w}x${h}`);
}

// Pastikan registri ringan di src/lib/pixel/sprites.ts sama dengan hasil gambar.
const { SPRITE_INFO } = await import("../../src/lib/pixel/sprites.ts");
for (const [name, { frames }] of Object.entries(SHEETS)) {
  const info = SPRITE_INFO[name as keyof typeof SPRITE_INFO];
  const w = frames[0]![0]!.length;
  const h = frames[0]!.length;
  if (!info || info.frames !== frames.length || info.w !== w || info.h !== h) {
    throw new Error(
      `SPRITE_INFO["${name}"] does not match: expected ${frames.length}f ${w}x${h}`,
    );
  }
}
