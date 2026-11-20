import type { Grid } from "./art";

const W = 24;
const H = 16;

export const STOREFRONT_AWNINGS = ["r", "p", "o"] as const;
export type Awning = (typeof STOREFRONT_AWNINGS)[number];

export type ShopKind = "warung" | "cafe" | "bakery" | "noodle" | "grill" | "fast";

/** Picks a building from the place's name and categories so the grid is not full of identical shops. */
export function shopKind(name: string, categories: string[] = []): ShopKind {
  const text = `${name} ${categories.join(" ")}`.toLowerCase();
  if (/kopi|coffee|cafe|café|kafe|teh|\btea\b|boba/.test(text)) return "cafe";
  if (/roti|bakery|bake|donat|donut|kue|cake|pastry/.test(text)) return "bakery";
  if (/bakso|\bmie\b|\bmi\b|soto|ramen|noodle|pho|ketoprak/.test(text)) return "noodle";
  if (/sate|satay|bbq|grill|bakar|geprek|steak/.test(text)) return "grill";
  if (/fast_food|burger|pizza|fried|kfc|nugget/.test(text)) return "fast";
  return "warung";
}

function canvas() {
  const g: string[][] = Array.from({ length: H }, () => Array<string>(W).fill("."));
  const fill = (x: number, y: number, w: number, h: number, ch: string) => {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) if (g[j] && i < W) g[j]![i] = ch;
  };
  const put = (x: number, y: number, ch: string) => fill(x, y, 1, 1, ch);
  const ground = () => {
    fill(0, 13, 24, 1, "o");
    fill(0, 14, 24, 1, "n");
    fill(0, 15, 24, 1, "k");
  };
  return { g, fill, put, ground, out: () => g.map((r) => r.join("")) };
}

function cafe(awning: Awning): Grid {
  const { g, fill, put, ground, out } = canvas();
  // hanging cup sign with steam
  fill(9, 1, 5, 2, "c");
  put(14, 1, "c");
  put(10, 0, "s");
  put(12, 0, "s");
  // flat teal awning with wide stripes
  fill(1, 3, 22, 1, "k");
  fill(0, 4, 24, 2, "k");
  for (let i = 1; i < 23; i++) {
    const ch = i % 6 < 3 ? "g" : "c";
    g[4]![i] = ch;
    g[5]![i] = ch;
  }
  fill(1, 6, 22, 1, "k");
  fill(2, 7, 20, 6, "m");
  // wide window with a cup
  fill(4, 8, 10, 4, "k");
  fill(5, 9, 8, 2, awning === "o" ? "Y" : "y");
  fill(8, 10, 3, 1, "c");
  put(9, 9, "s");
  // door
  fill(16, 8, 4, 5, "k");
  fill(17, 9, 2, 4, "n");
  put(18, 11, "y");
  // potted plants
  fill(1, 10, 2, 2, "G");
  fill(1, 12, 2, 1, "n");
  fill(21, 10, 2, 2, "G");
  fill(21, 12, 2, 1, "n");
  ground();
  return out();
}

function bakery(): Grid {
  const { g, fill, put, ground, out } = canvas();
  // scalloped orange roof
  fill(0, 1, 24, 1, "k");
  fill(0, 2, 24, 3, "o");
  for (let i = 0; i < W; i++) if (i % 4 < 2) g[5]![i] = "Y";
  fill(0, 5, 24, 1, "k");
  for (let i = 0; i < W; i++) if (i % 4 < 2) g[5]![i] = "Y";
  fill(2, 6, 20, 7, "m");
  // display window with shelves
  fill(3, 7, 9, 5, "k");
  fill(4, 8, 7, 3, "c");
  fill(4, 9, 7, 1, "n");
  for (const x of [5, 7, 9]) put(x, 8, "Y");
  // bread sign
  fill(14, 7, 7, 4, "k");
  fill(15, 8, 5, 2, "Y");
  fill(16, 8, 3, 1, "O");
  put(15, 8, "w");
  // little striped step
  for (let i = 12; i < 22; i++) put(i, 12, i % 2 ? "r" : "c");
  ground();
  return out();
}

function noodle(): Grid {
  const { fill, put, ground, out } = canvas();
  // chimney with steam
  fill(17, 1, 3, 3, "R");
  put(18, 0, "s");
  // tiled roof
  fill(3, 3, 18, 1, "k");
  fill(2, 4, 20, 1, "k");
  fill(1, 5, 22, 1, "k");
  fill(3, 4, 18, 1, "R");
  fill(2, 5, 20, 1, "B");
  fill(1, 6, 22, 1, "k");
  fill(2, 7, 20, 6, "m");
  // red lanterns
  for (const x of [3, 19]) {
    fill(x, 7, 2, 3, "r");
    put(x, 9, "k");
    put(x + 1, 9, "k");
  }
  // noren curtain
  fill(7, 7, 10, 4, "k");
  fill(8, 7, 8, 3, "c");
  for (const x of [11, 12]) fill(x, 7, 1, 3, "k");
  for (const x of [9, 14]) fill(x, 8, 1, 2, "r");
  // counter + bowl
  fill(1, 12, 22, 1, "n");
  fill(10, 11, 4, 1, "c");
  put(11, 10, "s");
  ground();
  return out();
}

function grill(awning: Awning): Grid {
  const { fill, put, ground, out } = canvas();
  const a = awning === "p" ? "p" : "r";
  fill(1, 2, 22, 1, "k");
  fill(0, 3, 24, 3, "k");
  for (let i = 1; i < 23; i++) for (const y of [3, 4]) put(i, y, i % 2 ? a : "y");
  fill(1, 6, 22, 1, "k");
  // string lights
  for (let i = 2; i < 22; i += 3) put(i, 7, "y");
  // posts and dark inside
  fill(2, 6, 1, 7, "n");
  fill(21, 6, 1, 7, "n");
  fill(3, 7, 18, 5, "B");
  // smoke
  for (const [x, y] of [
    [8, 5],
    [12, 4],
    [15, 5],
  ] as const)
    put(x, y, "s");
  // grill with skewers
  fill(5, 10, 14, 2, "k");
  for (let i = 6; i < 18; i++) put(i, 11, i % 2 ? "r" : "R");
  for (let i = 6; i < 18; i += 2) {
    put(i, 9, "n");
    put(i, 8, "O");
  }
  fill(1, 12, 22, 1, "n");
  ground();
  return out();
}

function fast(): Grid {
  const { fill, put, ground, out } = canvas();
  // flat roof sign with two arches
  fill(0, 2, 24, 1, "k");
  fill(0, 3, 24, 4, "r");
  fill(0, 7, 24, 1, "k");
  for (const x of [7, 12]) {
    fill(x, 4, 4, 1, "y");
    fill(x, 5, 1, 2, "y");
    fill(x + 3, 5, 1, 2, "y");
    put(x + 1, 5, "y");
    put(x + 2, 5, "y");
  }
  fill(1, 8, 22, 5, "m");
  // drive-through window
  fill(3, 9, 11, 3, "k");
  fill(4, 10, 9, 1, "g");
  // door and menu board
  fill(16, 8, 4, 5, "k");
  fill(17, 9, 2, 4, "b");
  fill(20, 9, 2, 3, "k");
  fill(21, 10, 1, 1, "y");
  ground();
  return out();
}

/** Tampak depan 24x16. `kind` memilih bangunan; `awning` mewarnai kanopi bila ada. */
export function storefront(awning: Awning, kind: ShopKind = "warung"): Grid {
  switch (kind) {
    case "cafe":
      return cafe(awning);
    case "bakery":
      return bakery();
    case "noodle":
      return noodle();
    case "grill":
      return grill(awning);
    case "fast":
      return fast();
    default:
      return warung(awning);
  }
}

/** Warung: kanopi belang, lampion, jendela menyala, papan neon, meja. */
function warung(awning: Awning): Grid {
  const g: string[][] = Array.from({ length: H }, () => Array<string>(W).fill("."));
  const fill = (x: number, y: number, w: number, h: number, ch: string) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j]![i] = ch;
  };
  // kanopi belang
  fill(1, 1, 22, 1, "k");
  fill(0, 2, 24, 2, "k");
  for (let i = 1; i < 23; i++) {
    const ch = i % 2 ? awning : "c";
    g[2]![i] = ch;
    g[3]![i] = ch;
  }
  fill(1, 4, 22, 1, "k");
  for (let i = 2; i < 22; i++) g[4]![i] = i % 2 ? awning : "c";
  fill(1, 5, 22, 1, "k");
  // tiang + dinding dalam
  fill(2, 6, 1, 8, "n");
  fill(21, 6, 1, 8, "n");
  fill(3, 6, 18, 7, "m");
  // jendela menyala
  fill(5, 7, 7, 4, "k");
  fill(6, 8, 5, 2, "y");
  // papan neon
  fill(13, 7, 7, 4, "k");
  fill(14, 8, 5, 2, "p");
  fill(15, 8, 1, 1, "w");
  fill(17, 9, 1, 1, "w");
  // lampion
  fill(4, 6, 1, 2, "y");
  fill(19, 6, 1, 2, "Y");
  // meja + mangkuk
  fill(1, 13, 22, 1, "o");
  fill(1, 14, 22, 1, "n");
  fill(1, 15, 22, 1, "k");
  fill(10, 12, 4, 1, "c");
  fill(11, 11, 2, 1, "s");
  return g.map((r) => r.join(""));
}
