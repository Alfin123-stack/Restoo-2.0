import { Canvas, type Grid } from "./art";

export const SCENE_W = 64;
export const SCENE_H = 32;

/** Adegan jalan warung 64x32 (tanpa langit: langit digambar CSS agar bisa berubah). */
export function buildWarungScene(): Grid {
  const c = new Canvas(SCENE_W, SCENE_H);

  // gedung latar
  c.rect(0, 10, 12, 18, "B");
  c.rect(0, 10, 12, 1, "k");
  c.rect(52, 7, 12, 21, "B");
  c.rect(52, 7, 12, 1, "k");
  for (const [x, y] of [
    [2, 13],
    [7, 13],
    [2, 18],
    [7, 18],
    [54, 10],
    [59, 10],
    [54, 16],
    [59, 16],
    [54, 22],
    [59, 22],
  ] as const) {
    c.rect(x, y, 3, 3, "y");
    c.rect(x, y, 3, 1, "Y");
  }

  // pohon kecil di kiri warung
  c.rect(13, 21, 2, 7, "n");
  c.box(11, 14, 6, 7, "g");
  c.px(13, 17, "G").px(14, 18, "G");

  // tiang + dinding belakang warung
  c.rect(18, 12, 2, 16, "n");
  c.rect(44, 12, 2, 16, "n");
  c.rect(20, 12, 24, 10, "y");
  c.rect(20, 12, 24, 1, "Y");
  c.rect(22, 15, 8, 5, "c");
  c.rect(22, 15, 8, 1, "k");
  c.rect(22, 19, 8, 1, "k");
  c.px(24, 17, "r").px(26, 17, "r").px(28, 17, "r");

  // kanopi belang merah-krem
  for (let x = 16; x < 48; x++) {
    const stripe = Math.floor((x - 16) / 4) % 2 === 0 ? "r" : "c";
    c.rect(x, 8, 1, 4, stripe);
    if (x % 4 < 2) c.px(x, 12, stripe);
  }
  c.rect(16, 7, 32, 1, "k");
  c.rect(16, 11, 32, 1, "R");

  // lampion
  for (const x of [24, 38]) {
    c.px(x + 1, 13, "k");
    c.box(x, 14, 3, 4, "r");
    c.px(x + 1, 16, "y");
  }

  // meja saji
  c.rect(17, 21, 30, 1, "O");
  c.rect(18, 22, 28, 6, "n");
  c.rect(18, 22, 28, 1, "O");
  for (let x = 20; x < 46; x += 6) c.rect(x, 24, 4, 3, "O");

  // lantai jalan
  c.rect(0, 28, 64, 4, "m");
  c.rect(0, 28, 64, 1, "k");
  for (let x = 0; x < 64; x += 8) c.rect(x, 30, 4, 1, "k");
  for (let x = 4; x < 64; x += 8) c.rect(x, 31, 4, 1, "k");

  // bendera hias
  c.rect(0, 3, 64, 1, "k");
  const colors = ["r", "y", "g", "b"];
  for (let x = 1, i = 0; x < 62; x += 5, i++) {
    const ch = colors[i % colors.length]!;
    c.rect(x, 4, 4, 1, ch);
    c.rect(x + 1, 5, 2, 1, ch);
  }
  return c.grid();
}
