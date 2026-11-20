/** Info ringan sprite sheet (frame, lebar, tinggi per frame). Diverifikasi oleh `npm run sprites`. */
export const SPRITE_INFO = {
  "mascot-idle": { frames: 4, w: 16, h: 18 },
  "mascot-jump": { frames: 4, w: 16, h: 18 },
  "mascot-sad": { frames: 4, w: 16, h: 18 },
  "bowl-steam": { frames: 2, w: 12, h: 10 },
  "heart-burst": { frames: 5, w: 16, h: 16 },
  cloud: { frames: 1, w: 24, h: 8 },
} as const;

export type SpriteName = keyof typeof SPRITE_INFO;
