/**
 * Sumber tunggal semua pixel art Restoo.
 * - Dipakai komponen React (ikon, sprite statis) dan skrip `scripts/sprites/build.mts`
 *   yang menghasilkan sprite sheet SVG di `public/sprites/`.
 * - Satu karakter = satu pixel. "." = transparan. "x" = currentColor (ikon monokrom).
 */

export type Grid = string[];

export const PALETTE: Record<string, string> = {
  // tema "Pasar Malam": ungu malam + neon
  k: "#0d0720", // tinta, outline
  m: "#2b1b52", // ungu malam
  w: "#ffffff",
  c: "#ffe9c7", // krem
  r: "#ff3d81", // pink neon
  R: "#b81f5a", // pink tua
  y: "#ffd93d", // kuning lampion
  Y: "#ff9f1c", // kuning tua
  g: "#19e3c0", // teal neon
  G: "#0b9c86", // teal tua
  b: "#2e1f6b", // langit malam
  B: "#241547", // langit malam tua
  o: "#ff8a3d", // oranye bulu kucing
  O: "#d4601f",
  n: "#7a3b2e", // cokelat
  p: "#ff7ad9", // pink muda
  s: "#bfa8ff", // uap / awan
  t: "#6c54c9", // awan bayangan
};

/** Memusatkan setiap baris pada lebar `width` agar tidak perlu menghitung titik manual. */
export function centered(width: number, rows: string[]): Grid {
  return rows.map((row) => {
    const left = Math.floor((width - row.length) / 2);
    return (
      ".".repeat(Math.max(0, left)) +
      row +
      ".".repeat(Math.max(0, width - row.length - left))
    );
  });
}

export function validate(name: string, grid: Grid): Grid {
  const width = grid[0]?.length ?? 0;
  grid.forEach((row, i) => {
    if (row.length !== width)
      throw new Error(`${name}: baris ${i} lebar ${row.length}, seharusnya ${width}`);
  });
  return grid;
}

/* ------------------------------------------------------------------ */
/* Kanvas kecil untuk menggambar lewat kode                            */
/* ------------------------------------------------------------------ */

export class Canvas {
  readonly cells: string[][];
  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.cells = Array.from({ length: h }, () => Array<string>(w).fill("."));
  }
  px(x: number, y: number, ch: string) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y]![x] = ch;
    return this;
  }
  rect(x: number, y: number, w: number, h: number, ch: string) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, ch);
    return this;
  }
  /** Kotak berbingkai 1px: pojok dibiarkan kosong supaya terlihat membulat. */
  box(x: number, y: number, w: number, h: number, fill: string, ink = "k") {
    this.rect(x, y, w, h, ink);
    this.rect(x + 1, y + 1, w - 2, h - 2, fill);
    return this;
  }
  grid(): Grid {
    return this.cells.map((row) => row.join(""));
  }
}

/** Menggeser seluruh gambar; area yang terbuka diisi transparan. */
export function shift(grid: Grid, dx: number, dy: number): Grid {
  const w = grid[0]!.length;
  const h = grid.length;
  const out = Array.from({ length: h }, () => Array<string>(w).fill("."));
  grid.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h) out[ny]![nx] = row[x]!;
    }
  });
  return out.map((r) => r.join(""));
}

export function recolor(grid: Grid, map: Record<string, string>): Grid {
  return grid.map((row) => [...row].map((ch) => map[ch] ?? ch).join(""));
}

/* ------------------------------------------------------------------ */
/* Ikon monokrom 8x8 (x = currentColor)                                */
/* ------------------------------------------------------------------ */

export const ICONS = {
  sun: [
    "...xx...",
    ".x.xx.x.",
    "..xxxx..",
    "xxxxxxxx",
    "xxxxxxxx",
    "..xxxx..",
    ".x.xx.x.",
    "...xx...",
  ],
  moon: [
    "..xxxx..",
    ".xxx....",
    "xxx.....",
    "xxx.....",
    "xxx.....",
    "xxxx....",
    ".xxxxxx.",
    "..xxxx..",
  ],
  search: [
    ".xxxx...",
    "x....x..",
    "x....x..",
    "x....x..",
    ".xxxx...",
    "....xx..",
    ".....xx.",
    "......xx",
  ],
  pin: [
    "..xxxx..",
    ".xxxxxx.",
    ".xx..xx.",
    ".xx..xx.",
    ".xxxxxx.",
    "..xxxx..",
    "...xx...",
    "...x....",
  ],
  clock: [
    "..xxxx..",
    ".x....x.",
    "x..x...x",
    "x..x...x",
    "x..xxx.x",
    "x......x",
    ".x....x.",
    "..xxxx..",
  ],
  phone: [
    "..xxxx..",
    "..x..x..",
    "..x..x..",
    "..x..x..",
    "..x..x..",
    "..xxxx..",
    "..x..x..",
    "..xxxx..",
  ],
  globe: [
    "..xxxx..",
    ".x.xx.x.",
    "x..xx..x",
    "xxxxxxxx",
    "xxxxxxxx",
    "x..xx..x",
    ".x.xx.x.",
    "..xxxx..",
  ],
  share: [
    "...xx...",
    "..xxxx..",
    ".x.xx.x.",
    "...xx...",
    "x..xx..x",
    "x......x",
    "x......x",
    "xxxxxxxx",
  ],
  menu: [
    "........",
    "xxxxxxxx",
    "........",
    "xxxxxxxx",
    "........",
    "xxxxxxxx",
    "........",
    "........",
  ],
  close: [
    "xx....xx",
    "xxx..xxx",
    ".xxxxxx.",
    "..xxxx..",
    "..xxxx..",
    ".xxxxxx.",
    "xxx..xxx",
    "xx....xx",
  ],
  "arrow-left": [
    "...x....",
    "..xx....",
    ".xxxxxxx",
    "xxxxxxxx",
    "xxxxxxxx",
    ".xxxxxxx",
    "..xx....",
    "...x....",
  ],
  "arrow-right": [
    "....x...",
    "....xx..",
    "xxxxxxx.",
    "xxxxxxxx",
    "xxxxxxxx",
    "xxxxxxx.",
    "....xx..",
    "....x...",
  ],
  play: [
    "xx......",
    "xxxx....",
    "xxxxxx..",
    "xxxxxxxx",
    "xxxxxx..",
    "xxxx....",
    "xx......",
    "........",
  ],
  sound: [
    "...x....",
    "..xx..x.",
    "xxxx...x",
    "xxxx.x.x",
    "xxxx.x.x",
    "xxxx...x",
    "..xx..x.",
    "...x....",
  ],
  mute: [
    "...x....",
    "..xx.x.x",
    "xxxx..x.",
    "xxxx..x.",
    "xxxx.x.x",
    "xxxx....",
    "..xx....",
    "...x....",
  ],
  back: [
    "......xx",
    "....xxxx",
    "..xxxxxx",
    "xxxxxxxx",
    "..xxxxxx",
    "....xxxx",
    "......xx",
    "........",
  ],
  alert: [
    "...xx...",
    "...xx...",
    "...xx...",
    "...xx...",
    "...xx...",
    "........",
    "...xx...",
    "...xx...",
  ],
  dice: [
    "xxxxxxxx",
    "xxxxxxxx",
    "xx.xx.xx",
    "xxxxxxxx",
    "xxxxxxxx",
    "xx.xx.xx",
    "xxxxxxxx",
    "xxxxxxxx",
  ],
  check: [
    "........",
    "......xx",
    ".....xx.",
    "x...xx..",
    "xx.xx...",
    ".xxx....",
    "..x.....",
    "........",
  ],
  list: [
    "xx.xxxxx",
    "xx.xxxxx",
    "........",
    "xx.xxxxx",
    "xx.xxxxx",
    "........",
    "xx.xxxxx",
    "xx.xxxxx",
  ],
  filter: [
    "xxxxxxxx",
    ".xxxxxx.",
    "..xxxx..",
    "...xx...",
    "...xx...",
    "...xx...",
    "...xx...",
    "........",
  ],
  plus: [
    "...xx...",
    "...xx...",
    "...xx...",
    "xxxxxxxx",
    "xxxxxxxx",
    "...xx...",
    "...xx...",
    "...xx...",
  ],
  trash: [
    "..xxxx..",
    "xxxxxxxx",
    "........",
    ".x.xx.x.",
    ".x.xx.x.",
    ".x.xx.x.",
    ".x.xx.x.",
    ".xxxxxx.",
  ],
  navigate: [
    "...xx...",
    "..xxxx..",
    ".xxxxxx.",
    "xxxxxxxx",
    "xxx..xxx",
    "xx....xx",
    "x......x",
    "........",
  ],
} satisfies Record<string, Grid>;

export type IconName = keyof typeof ICONS;

/* ------------------------------------------------------------------ */
/* Ikon berwarna                                                       */
/* ------------------------------------------------------------------ */

export const HEART: Grid = centered(9, [
  ".kkk.kkk.",
  "krrrkrrrk",
  "krwrrrrrk",
  "krrrrrrrk",
  ".krrrrrk.",
  "..krrrk..",
  "...krk...",
  "....k....",
]);
export const HEART_EMPTY: Grid = recolor(HEART, { r: "c", w: "c" });

export const STAR: Grid = centered(9, [
  "....k....",
  "...kyk...",
  "..kyyyk..",
  "kkkyyykkk",
  "kyyyyyyyk",
  ".kyyyyyk.",
  ".kyykyyk.",
  "kyyk.kyyk",
  ".kk...kk.",
]);
export const STAR_EMPTY: Grid = recolor(STAR, { y: "s" });

export const COIN: Grid = centered(8, [
  "..kkkk..",
  ".kyyyyk.",
  "kyyYYyyk",
  "kyYyyYyk",
  "kyYyyYyk",
  "kyyYYyyk",
  ".kyyyyk.",
  "..kkkk..",
]);

export const PLATE: Grid = centered(14, [
  "..kkkkkkkkkk..",
  ".kccccccccccK.".replace("K", "k"),
  "kcc.wwwwww.cck",
  "kc.wwccccww.ck",
  "kc.wccrrccw.ck",
  "kcc.wwccww.cck",
  ".kcc..ww..cck.",
  "..kkkkkkkkkk..",
]);

/** Penanda peta, ujung runcing di bawah tengah. */
export const PIN: Grid = [
  "..kkkkkk..",
  ".krrrrrrk.",
  "krrrrrrrrk",
  "krrrwwrrrk",
  "krrrwwrrrk",
  "krrrrrrrrk",
  ".krrrrrrk.",
  ".krrrrrrk.",
  "..krrrrk..",
  "..krrrrk..",
  "...krrk...",
  "...kkkk...",
  "....kk....",
];

/** Logo mangkuk beruap, 2 frame. */
const BOWL_BASE = [
  "............",
  "............",
  "............",
  ".kkkkkkkkkk.",
  "kyyoyyyoyyyk",
  "kgyyyyywyyyk",
  ".krrrrrrrrk.",
  ".krrrrrrrrk.",
  "..kkrrrrkk..",
  "....kkkk....",
];
function bowlFrame(steam: [number, number][]): Grid {
  const g = BOWL_BASE.map((r) => r.split(""));
  for (const [x, y] of steam) if (g[y]) g[y]![x] = "s";
  return g.map((r) => r.join(""));
}
export const BOWL_FRAMES: Grid[] = [
  bowlFrame([
    [3, 0],
    [6, 0],
    [4, 1],
    [7, 1],
    [3, 2],
    [6, 2],
  ]),
  bowlFrame([
    [4, 0],
    [7, 0],
    [3, 1],
    [6, 1],
    [4, 2],
    [7, 2],
  ]),
];
export const BOWL: Grid = BOWL_FRAMES[0]!;

/* ------------------------------------------------------------------ */
/* Makanan 12x12 (roulette, ubin, placeholder)                          */
/* ------------------------------------------------------------------ */

export const FOODS = {
  "es-teh": centered(12, [
    "......kk",
    ".....kr.",
    "..kkkkkkkk..",
    "..kwoooook..",
    "..kwoooook..",
    "..kooooook..",
    "...kooook...",
    "...kooook...",
    "....kook....",
    "....kkkk....",
  ]),
  sate: centered(12, [
    "..........kk",
    ".........kn.",
    "...kkkk.kn..",
    "..knnnnkn...",
    "..knnnnn....",
    ".kknnnk.....",
    "knnkkk......",
    "kkk.........",
  ]),
  bakso: centered(12, [
    "...s..s.....",
    "....s..s....",
    ".kkkkkkkkkk.",
    "kcnncnnncnck",
    "kccnncnncccK".replace("K", "k"),
    ".kyyyyyyyyk.",
    "..kyyyyyyk..",
    "...kkkkkk...",
  ]),
  ayam: centered(12, [
    "....kkkk....",
    "...koooook..",
    "..koOooooOk.",
    "..kooooooOk.",
    "..kOoooooOk.",
    "...kooooOk..",
    "....kooOk...",
    ".....kok....",
    "....kcck....",
    "...kcckkck..",
    "...kkk.kkk..",
  ]),
  "nasi-goreng": centered(12, [
    "............",
    "...kkkkkk...",
    "..knnonnok..",
    ".knnoonnonk.",
    "knnonnwwnonk".slice(0, 12),
    "knonnwywnnok".slice(0, 12),
    "kkkkkkkkkkkk",
    ".kccccccccck",
  ]),
  kopi: centered(12, [
    "...s..s.....",
    "....s..s....",
    ".kkkkkkkkk..",
    ".knnnnnnnkkk",
    ".knnnnnnnk.k",
    ".knnnnnnnk.k",
    "..knnnnnkkk.",
    "..kkkkkkk...",
  ]),
} satisfies Record<string, Grid>;

export type FoodName = keyof typeof FOODS;
export const FOOD_LABELS: Record<FoodName, string> = {
  "es-teh": "Es teh",
  sate: "Sate",
  bakso: "Bakso",
  ayam: "Ayam goreng",
  "nasi-goreng": "Nasi goreng",
  kopi: "Kopi",
};

/* ------------------------------------------------------------------ */
/* Maskot: Koki Meong, kucing koki 16x16                                */
/* ------------------------------------------------------------------ */

export type MascotMood = "idle" | "blink" | "happy" | "sad";

const MH = 18; // tinggi kanvas maskot; 2 baris teratas disisakan untuk lompatan
function mascotBase(mood: MascotMood): Canvas {
  const c = new Canvas(16, MH);
  const Y = 2;
  const box = (x: number, y: number, w: number, h: number, f: string) =>
    c.box(x, y + Y, w, h, f);
  const px = (x: number, y: number, ch: string) => c.px(x, y + Y, ch);
  const rect = (x: number, y: number, w: number, h: number, ch: string) =>
    c.rect(x, y + Y, w, h, ch);
  // telinga (digambar dulu, topi menutupi sebagian)
  box(2, 3, 4, 5, "o");
  box(10, 3, 4, 5, "o");
  px(3, 5, "p");
  px(12, 5, "p");
  // kepala
  box(2, 5, 12, 7, "o");
  // pipi + moncong
  px(4, 9, "p");
  px(11, 9, "p");
  rect(6, 9, 4, 2, "c");
  px(7, 9, "p");
  px(8, 9, "p");
  px(6, 10, "k");
  px(9, 10, "k");
  // kumis
  px(1, 9, "k");
  px(14, 9, "k");
  px(0, 10, "k");
  px(15, 10, "k");
  // mata
  if (mood === "blink") {
    rect(4, 8, 2, 1, "k");
    rect(10, 8, 2, 1, "k");
  } else if (mood === "happy") {
    px(4, 8, "k");
    px(5, 7, "k");
    px(6, 8, "k");
    px(9, 8, "k");
    px(10, 7, "k");
    px(11, 8, "k");
  } else if (mood === "sad") {
    rect(5, 7, 1, 2, "k");
    rect(10, 7, 1, 2, "k");
    px(4, 7, "k");
    px(11, 7, "k");
    px(5, 9, "b");
    px(7, 10, "c");
    px(8, 10, "c");
    px(7, 11, "k");
    px(8, 11, "k");
  } else {
    rect(5, 7, 1, 2, "k");
    rect(10, 7, 1, 2, "k");
  }
  // topi koki (terakhir agar menutupi telinga)
  box(4, 0, 8, 5, "c");
  rect(5, 3, 6, 1, "t");
  // badan: jas koki + lengan
  rect(4, 12, 8, 4, "c");
  rect(4, 12, 1, 4, "k");
  rect(11, 12, 1, 4, "k");
  rect(4, 15, 8, 1, "k");
  px(7, 13, "k");
  px(8, 13, "k");
  px(7, 14, "r");
  px(8, 14, "r");
  box(2, 12, 3, 3, "o");
  box(11, 12, 3, 3, "o");
  return c;
}

export const MASCOT = {
  idle: mascotBase("idle").grid(),
  blink: mascotBase("blink").grid(),
  happy: mascotBase("happy").grid(),
  sad: mascotBase("sad").grid(),
};

export const MASCOT_IDLE_FRAMES: Grid[] = [
  MASCOT.idle,
  shift(MASCOT.idle, 0, 1),
  MASCOT.idle,
  shift(MASCOT.blink, 0, 1),
];

function raiseArms(g: Grid): Grid {
  const c = new Canvas(16, MH);
  g.forEach((row, y) => [...row].forEach((ch, x) => c.px(x, y, ch)));
  // lengan terangkat (kanvas sudah menyertakan offset 2 baris)
  c.rect(2, 14, 3, 3, ".");
  c.rect(11, 14, 3, 3, ".");
  c.box(1, 11, 3, 4, "o");
  c.box(12, 11, 3, 4, "o");
  return c.grid();
}

export const MASCOT_JUMP_FRAMES: Grid[] = [
  shift(raiseArms(MASCOT.happy), 0, 1),
  shift(raiseArms(MASCOT.happy), 0, -1),
  shift(raiseArms(MASCOT.happy), 0, -2),
  shift(raiseArms(MASCOT.happy), 0, -1),
];

function withTear(g: Grid, y: number): Grid {
  const c = new Canvas(16, MH);
  g.forEach((row, yy) => [...row].forEach((ch, x) => c.px(x, yy, ch)));
  c.px(5, y + 2, "b");
  return c.grid();
}
export const MASCOT_SAD_FRAMES: Grid[] = [
  shift(withTear(MASCOT.sad, 9), 0, 0),
  shift(withTear(MASCOT.sad, 10), 0, 1),
  shift(withTear(MASCOT.sad, 11), 0, 1),
  shift(withTear(MASCOT.sad, 9), 0, 0),
];

/* ------------------------------------------------------------------ */
/* Efek                                                                */
/* ------------------------------------------------------------------ */

export const CLOUD: Grid = centered(24, [
  "......kkkk......",
  "....kkssssk.kkk.",
  "...kssssssksssk.",
  ".kkksssssssssssk",
  "ksssssssssssssst",
  "ksssssssssssstt.",
  ".kkttttttttttkk.",
  "...kkkkkkkkkkk..",
]);

/** Ledakan hati untuk tombol favorit: 5 frame 16x16. */
export const HEART_BURST_FRAMES: Grid[] = (() => {
  const dirs: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ];
  const colors = ["r", "y", "p", "r", "y", "p", "r", "y"];
  const heartAt = (c: Canvas, scale: "s" | "m" | "l") => {
    const h = scale === "l" ? HEART : scale === "m" ? HEART : HEART;
    const ox = Math.floor((16 - 9) / 2);
    const oy = scale === "s" ? 5 : 4;
    h.forEach((row, y) =>
      [...row].forEach((ch, x) => ch !== "." && c.px(ox + x, oy + y, ch)),
    );
  };
  return [0, 1, 2, 3, 4].map((i) => {
    const c = new Canvas(16, 16);
    heartAt(c, i === 0 || i === 4 ? "s" : "l");
    if (i >= 1) {
      const r = 2 + i * 1.1;
      dirs.forEach(([dx, dy], n) => {
        const x = Math.round(7.5 + dx * r);
        const y = Math.round(7.5 + dy * r);
        c.px(x, y, colors[n]!);
        if (i < 3) c.px(x + 1, y, colors[n]!);
      });
    }
    return c.grid();
  });
})();

/** Registri sprite sheet: nama → frame (dipakai skrip build dan komponen Sprite). */
export const SHEETS: Record<string, { frames: Grid[] }> = {
  "mascot-idle": { frames: MASCOT_IDLE_FRAMES },
  "mascot-jump": { frames: MASCOT_JUMP_FRAMES },
  "mascot-sad": { frames: MASCOT_SAD_FRAMES },
  "bowl-steam": { frames: BOWL_FRAMES },
  "heart-burst": { frames: HEART_BURST_FRAMES },
  cloud: { frames: [CLOUD] },
};

export function sheetInfo(name: string) {
  const sheet = SHEETS[name];
  if (!sheet) throw new Error(`Sprite tidak dikenal: ${name}`);
  const first = sheet.frames[0]!;
  return { frames: sheet.frames.length, w: first[0]!.length, h: first.length };
}

/* ------------------------------------------------------------------ */
/* Grid → rect (run-length per baris agar SVG tetap kecil)              */
/* ------------------------------------------------------------------ */

export type PixelRect = { x: number; y: number; w: number; fill: string };

/** Warna yang berubah mengikuti tema (variabel CSS --pal-*); sisanya tetap. */
const THEMED = new Set(["b", "B", "m", "s", "t"]);

export function gridToRects(
  grid: Grid,
  offsetX = 0,
  mono = "currentColor",
  themed = false,
): PixelRect[] {
  const rects: PixelRect[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x]!;
      if (ch === ".") {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const base = ch === "x" ? mono : PALETTE[ch];
      const fill = themed && base && THEMED.has(ch) ? `var(--pal-${ch}, ${base})` : base;
      if (fill) rects.push({ x: offsetX + x, y, w: end - x, fill });
      x = end;
    }
  });
  return rects;
}
