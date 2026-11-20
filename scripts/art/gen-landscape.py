"""
Generates the pixel landscape layers for the landing hero (public/scene/*.png).
Original artwork drawn procedurally: day and night palettes, one PNG per layer so the page
can move layers at different speeds. Run: python3 scripts/art/gen-landscape.py
"""
import math, os, random
import numpy as np
from PIL import Image

W, H = 320, 200
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "scene")
os.makedirs(OUT, exist_ok=True)

def hexc(h):
    h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) + (255,)

PAL = {
  "day": dict(
    cloud="#ffffff", cloud_shade="#cfe3fa", cloud_deep="#a8c9f0",
    city="#7e9cc4", city_lit="#93afd2", city_win="#c8dcf2", hill="#5fa66b", hill2="#4f9a4f",
    grass1="#74c34c", grass2="#58a63f", grass3="#3a8736", grass4="#2a6a2e", grass_hi="#97dc66",
    leaf_hi="#5fb54a", leaf1="#3f9640", leaf2="#2f7a34", leaf3="#1f5a2b",
    trunk="#5a3f27", trunk_hi="#7a5738", trunk_dk="#3a281a",
    path="#d9c28a", path_hi="#ead9a8", path_dk="#b79b63",
    flower_r="#e8423a", flower_y="#ffd23f", flower_w="#ffffff", berry="#d9302f",
    wood="#8a5a35", wood_dk="#5e3b22", wood_hi="#b07a4a",
    awn_a="#d9483b", awn_b="#fff3dc", awn_dk="#a8322a", roof="#6b4a33",
    counter="#a9754a", counter_hi="#c99468", cloth="#fff3dc", bowl="#f4efe4", soup="#e3a13a",
    sign="#2b2140", sign_hi="#ffd23f", lantern="#ff9a3c", lantern_hi="#ffe29a",
    shadow=(0, 40, 20, 70), glow=(255, 214, 120, 0),
    win="#9fd0f5", stool="#3a8a8f",
  ),
  "night": dict(
    cloud="#6a58aa", cloud_shade="#4b3d88", cloud_deep="#372d6e",
    city="#3a3678", city_lit="#4a458c", city_win="#ffd27a", hill="#2c3566", hill2="#242b58",
    grass1="#2f6b4a", grass2="#265a40", grass3="#1b4433", grass4="#12302a", grass_hi="#3f8458",
    leaf_hi="#2f6a52", leaf1="#245844", leaf2="#1a4535", leaf3="#102f28",
    trunk="#2d2030", trunk_hi="#46344a", trunk_dk="#1c1320",
    path="#5b5278", path_hi="#6e6590", path_dk="#463e62",
    flower_r="#c8506a", flower_y="#e9b84a", flower_w="#cfc7ee", berry="#c04060",
    wood="#4a3358", wood_dk="#2f2040", wood_hi="#66487a",
    awn_a="#b8404f", awn_b="#e8d3c0", awn_dk="#7c2a3e", roof="#33233f",
    counter="#6d4a52", counter_hi="#8c6168", cloth="#e8d3c0", bowl="#efe3d6", soup="#e3a13a",
    sign="#1b1236", sign_hi="#ffd23f", lantern="#ffb04a", lantern_hi="#fff0b8",
    shadow=(5, 5, 25, 90), glow=(255, 190, 100, 0),
    win="#ffd27a", stool="#2e6a78",
  ),
}

BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0

class Layer:
    def __init__(self, w=None, h=None):
        self.w, self.h = w or W, h or H
        self.a = np.zeros((self.h, self.w, 4), np.uint8)
    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h: self.a[y, x] = c
    def rect(self, x0, y0, x1, y1, c):
        x0, y0 = max(0, x0), max(0, y0); x1, y1 = min(self.w, x1), min(self.h, y1)
        if x1 > x0 and y1 > y0: self.a[y0:y1, x0:x1] = c
    def save(self, name):
        Image.fromarray(self.a, "RGBA").save(os.path.join(OUT, name), optimize=True)

def noise_grid(seed, scale):
    r = random.Random(seed)
    gw, gh = W // scale + 2, H // scale + 2
    g = [[r.random() for _ in range(gw)] for _ in range(gh)]
    def f(x, y):
        gx, gy = x / scale, y / scale
        x0, y0 = int(gx), int(gy); tx, ty = gx - x0, gy - y0
        tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty)
        a = g[y0][x0] * (1 - tx) + g[y0][x0 + 1] * tx
        b = g[y0 + 1][x0] * (1 - tx) + g[y0 + 1][x0 + 1] * tx
        return a * (1 - ty) + b * ty
    return f

def disc_mask(shape, discs):
    m = np.zeros(shape, bool)
    ys, xs = np.mgrid[0:shape[0], 0:shape[1]]
    for cx, cy, r in discs:
        m |= (xs - cx) ** 2 + (ys - cy) ** 2 <= r * r
    return m

def shade_mass(L, mask, light_dir, tones, seed, strength=1.0, hl=None):
    """Fill mask with 3-4 tone shading: lit from top-left, ordered dither between tones, noise clumps."""
    n = noise_grid(seed, 6)
    ys, xs = np.nonzero(mask)
    if len(xs) == 0: return
    cx, cy = xs.mean(), ys.mean()
    span = max(xs.max() - xs.min(), ys.max() - ys.min()) / 2 + 1
    for y, x in zip(ys, xs):
        # light value: higher near top-left of the mass, with clumpy noise
        d = ((x - cx) * light_dir[0] + (y - cy) * light_dir[1]) / span
        v = 0.5 - d * 0.45 * strength + (n(x, y) - 0.5) * 0.55
        v += (BAYER[y % 4, x % 4] - 0.5) * 0.22
        k = len(tones) - 1
        idx = min(k, max(0, int(v * (k + 1))))
        L.px(int(x), int(y), tones[k - idx] if False else tones[idx])

def build(theme):
    P = {k: (hexc(v) if isinstance(v, str) else v) for k, v in PAL[theme].items()}
    night = theme == "night"
    rnd = random.Random(11)

    # ---------- clouds ----------
    def cloud_layer(name, specs, seed):
        L = Layer()
        for cx, cy, w, hgt in specs:
            discs = []
            n = max(4, w // 12)
            for i in range(n):
                t = i / (n - 1) if n > 1 else 0.5
                r = int(hgt * (0.5 + 0.5 * math.sin(t * math.pi)) * (0.7 + rnd.random() * 0.5)) + 5
                discs.append((cx - w / 2 + t * w, cy - r * 0.35 + rnd.randint(-3, 3), r))
            # flat-ish bottom: clip
            m = disc_mask((H, W), discs)
            m[int(cy + hgt * 0.45):, :] = False
            ys, xs = np.nonzero(m)
            if len(ys) == 0: continue
            top, bot = ys.min(), ys.max()
            for y, x in zip(ys, xs):
                t = (y - top) / max(1, bot - top)
                v = t * 1.25 + (BAYER[y % 4, x % 4] - 0.5) * 0.18
                c = P["cloud"] if v < 0.55 else (P["cloud_shade"] if v < 0.95 else P["cloud_deep"])
                L.px(int(x), int(y), c)
        L.save(name)
    cloud_layer(f"clouds-far-{theme}.png", [(205, 40, 80, 15), (292, 52, 60, 12)], 1)
    cloud_layer(f"clouds-near-{theme}.png", [(215, 80, 110, 20), (160, 100, 50, 10)], 2)

    # ---------- sky details (stars + moon at night) ----------
    L = Layer()
    if night:
        for _ in range(110):
            x, y = rnd.randint(0, W - 1), rnd.randint(0, 100)
            L.px(x, y, hexc("#fff6e0") if rnd.random() < .6 else hexc("#ffb3e6"))
        for _ in range(10):
            x, y = rnd.randint(4, W - 5), rnd.randint(4, 80)
            for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)): L.px(x + dx, y + dy, hexc("#fff6e0"))
        mx, my, mr = 150, 22, 10
        for y in range(my - mr, my + mr + 1):
            for x in range(mx - mr, mx + mr + 1):
                if (x - mx) ** 2 + (y - my) ** 2 <= mr * mr:
                    lit = (x - (mx + 3)) ** 2 + (y - (my - 2)) ** 2 > (mr - 1) ** 2 or True
                    c = hexc("#fff3c4")
                    if (x - mx + 4) ** 2 + (y - my - 2) ** 2 < 9 and BAYER[y % 4, x % 4] < .6: c = hexc("#e6d595")
                    if (x - mx - 4) ** 2 + (y - my + 4) ** 2 < 5: c = hexc("#e6d595")
                    L.px(x, y, c)
    L.save(f"sky-{theme}.png")

    # ---------- distant city + hills ----------
    L = Layer()
    base = 122
    # far hills
    for x in range(W):
        h = 112 + int(4 * math.sin(x / 31.0) + 3 * math.sin(x / 13.0 + 1.3))
        for y in range(h, base + 4):
            L.px(x, y, P["hill"] if (y - h) < 3 or BAYER[y % 4, x % 4] < 0.5 else P["hill2"])
    # buildings
    x = 70
    r2 = random.Random(5)
    while x < 215:
        w = r2.randint(6, 13); h = r2.randint(9, 26)
        if 118 <= x <= 134: w, h = 10, 20
        for xx in range(x, x + w):
            for y in range(base - h, base):
                L.px(xx, y, P["city_lit"] if xx < x + 2 else P["city"])
        # windows
        for yy in range(base - h + 2, base - 2, 3):
            for xx in range(x + 2, x + w - 1, 3):
                if r2.random() < (0.55 if night else 0.35): L.px(xx, yy, P["city_win"])
        x += w + r2.randint(0, 2)
    # tall tower with segments (generic landmark)
    tx = 126
    for i in range(7):
        top = base - 62 + i * 8
        wdt = 6 if i % 2 == 0 else 4
        L.rect(tx - wdt // 2 + 1, top, tx + wdt // 2 + 2, top + 8, P["city_lit"] if i % 2 else P["city"])
    L.rect(tx, base - 78, tx + 2, base - 62, P["city"])
    L.rect(tx - 5, base - 20, tx + 8, base, P["city"])
    L.save(f"city-{theme}.png")

    # ---------- midground: path, bench, left tree, bushes ----------
    L = Layer()
    # meadow base between hills and foreground
    for y in range(118, 140):
        for x in range(W):
            t = (y - 118) / 22
            c = P["grass1"] if BAYER[y % 4, x % 4] > t * 0.8 else P["grass2"]
            L.px(x, y, c)
    # winding path
    for y in range(124, 160):
        t = (y - 124) / 36
        cx = 10 + t * 150 + 25 * math.sin(t * 3.0)
        wdt = 6 + t * 36
        for x in range(int(cx - wdt), int(cx + wdt)):
            edge = abs(x - cx) > wdt - 2
            c = P["path_dk"] if edge else (P["path_hi"] if BAYER[y % 4, x % 4] < 0.3 else P["path"])
            L.px(x, y, c)
    # bench
    for x0 in (44,):
        L.rect(x0, 119, x0 + 14, 121, P["wood_hi"]); L.rect(x0, 121, x0 + 14, 123, P["wood"])
        L.rect(x0 + 1, 123, x0 + 3, 127, P["wood_dk"]); L.rect(x0 + 11, 123, x0 + 13, 127, P["wood_dk"])
        L.rect(x0, 115, x0 + 14, 117, P["wood"])
    # left tree
    tree = disc_mask((H, W), [(60, 96, 20), (45, 104, 15), (74, 104, 15), (60, 86, 15), (50, 92, 12), (70, 90, 12)])
    L.rect(57, 108, 62, 124, P["trunk"]); L.rect(57, 108, 59, 124, P["trunk_hi"])
    shade_mass(L, tree, (0.8, 0.6), [P["leaf_hi"], P["leaf1"], P["leaf2"], P["leaf3"]], 3)
    # bushes along horizon
    for bx, by, br in ((14, 124, 9), (92, 126, 8), (190, 122, 8), (240, 126, 10)):
        bm = disc_mask((H, W), [(bx, by, br), (bx - br // 2, by + 2, br - 2), (bx + br // 2, by + 2, br - 2)])
        bm[by + 5:, :] = False
        shade_mass(L, bm, (0.8, 0.7), [P["leaf_hi"], P["leaf1"], P["leaf2"], P["leaf3"]], bx)
    L.save(f"mid-{theme}.png")

    # ---------- big tree at right edge ----------
    L = Layer()
    L.rect(268, 78, 290, 150, P["trunk"]); L.rect(268, 78, 273, 150, P["trunk_hi"]); L.rect(285, 78, 290, 150, P["trunk_dk"])
    for y in range(78, 150, 4): L.px(276 + (y // 4) % 3, y, P["trunk_dk"])
    # roots
    for i in range(6): L.rect(262 + i, 148 + i // 2, 296 - i, 152 + i // 2, P["trunk"])
    discs = [(300, 20, 46), (262, 36, 36), (232, 54, 30), (290, 70, 34), (250, 74, 26), (216, 40, 20), (275, 8, 30), (240, 14, 26)]
    m = disc_mask((H, W), discs)
    n2 = noise_grid(9, 5)
    ys, xs = np.nonzero(m)
    for y, x in zip(ys, xs):
        # ragged lower edge: hanging leaf clumps
        pass
    # ragged edge: erode mask with noise near boundary
    er = np.zeros_like(m)
    for y in range(H):
        for x in range(W):
            if m[y, x]:
                near = False
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (2, 0), (0, 2), (-2, 0), (0, -2)):
                    xx, yy = x + dx, y + dy
                    if not (0 <= xx < W and 0 <= yy < H) or not m[yy, xx]: near = True; break
                er[y, x] = (not near) or n2(x, y) > 0.38
    shade_mass(L, er, (0.7, 0.8), [P["leaf_hi"], P["leaf1"], P["leaf2"], P["leaf3"]], 4, 1.1)
    L.save(f"tree-{theme}.png")

    # ---------- foreground grass + flowers ----------
    L = Layer()
    n3 = noise_grid(21, 7)
    for y in range(138, H):
        t = (y - 138) / (H - 138)
        for x in range(W):
            v = n3(x, y) * 0.7 + t * 0.5 + (BAYER[y % 4, x % 4] - 0.5) * 0.3
            c = P["grass_hi"] if v < 0.28 else P["grass1"] if v < 0.52 else P["grass2"] if v < 0.75 else P["grass3"] if v < 0.95 else P["grass4"]
            L.px(x, y, c)
    # ragged top edge blends into midground
    for x in range(W):
        for y in range(134, 140):
            if rnd.random() < (y - 134) / 6: continue
            L.px(x, y, P["grass2"])
    # tufts
    for _ in range(170):
        x, y = rnd.randint(0, W - 3), rnd.randint(142, H - 3)
        c = P["grass_hi"] if rnd.random() < .5 else P["grass4"]
        L.px(x, y, c); L.px(x + 1, y - 1, c); L.px(x + 2, y, c); L.px(x + 1, y, c)
    # flowers
    for _ in range(46):
        x, y = rnd.randint(2, W - 4), rnd.randint(146, H - 6)
        col = rnd.choice(["flower_r", "flower_y", "flower_w"])
        L.px(x, y, P[col]); L.px(x - 1, y, P[col]); L.px(x + 1, y, P[col]); L.px(x, y - 1, P[col]); L.px(x, y + 1, P[col]); L.px(x, y, P["flower_y"] if col != "flower_y" else P["wood"])
        L.px(x, y + 2, P["grass4"])
    # sunflower-ish tall yellow flower, left
    sx, sy = 96, 160
    L.rect(sx, sy, sx + 2, sy + 22, P["grass3"])
    for dx, dy in ((-3, -2), (-3, 0), (4, -2), (4, 0), (0, -5), (1, -5), (0, 3), (1, 3)):
        L.rect(sx + dx, sy + dy, sx + dx + 2, sy + dy + 2, P["flower_y"])
    L.rect(sx - 1, sy - 3, sx + 4, sy + 3, P["wood_dk"])
    L.rect(sx, sy - 2, sx + 3, sy + 2, P["wood"])
    # big bush bottom-left
    bm = disc_mask((H, W), [(18, 190, 26), (46, 196, 22), (0, 176, 20), (30, 180, 16)])
    shade_mass(L, bm, (0.7, 0.8), [P["leaf_hi"], P["leaf1"], P["leaf2"], P["leaf3"]], 8)
    for _ in range(9):
        x, y = rnd.randint(4, 50), rnd.randint(168, 196)
        if bm[y, x]: L.px(x, y, P["berry"]); L.px(x + 1, y, P["berry"])
    L.save(f"grass-{theme}.png")

    # ---------- warung (hero object) ----------
    L = Layer()
    x0, y0 = 196, 108  # top-left of stall
    # ground shadow
    for y in range(168, 174):
        for x in range(x0 - 14, x0 + 92):
            if ((x - (x0 + 38)) / 56) ** 2 + ((y - 170) / 4) ** 2 <= 1: L.px(x, y, P["shadow"])
    # posts
    L.rect(x0 + 2, y0 + 16, x0 + 5, y0 + 62, P["wood_dk"]); L.rect(x0 + 74, y0 + 16, x0 + 77, y0 + 62, P["wood_dk"])
    # back wall with window glow at night
    L.rect(x0 + 5, y0 + 20, x0 + 74, y0 + 50, P["wood"])
    for yy in range(y0 + 20, y0 + 50, 4):
        L.rect(x0 + 5, yy, x0 + 74, yy + 1, P["wood_dk"])
    L.rect(x0 + 14, y0 + 24, x0 + 40, y0 + 42, P["win"])
    L.rect(x0 + 14, y0 + 24, x0 + 40, y0 + 25, P["wood_dk"]); L.rect(x0 + 26, y0 + 24, x0 + 28, y0 + 42, P["wood_dk"])
    L.rect(x0 + 14, y0 + 40, x0 + 40, y0 + 42, P["wood_dk"])
    # menu board
    L.rect(x0 + 48, y0 + 24, x0 + 70, y0 + 42, P["sign"])
    for i, yy in enumerate(range(y0 + 27, y0 + 41, 4)):
        L.rect(x0 + 51, yy, x0 + 51 + 12 - (i % 2) * 4, yy + 1, P["sign_hi"])
        L.rect(x0 + 65, yy, x0 + 68, yy + 1, P["sign_hi"])
    # roof + striped awning
    L.rect(x0 - 4, y0 + 2, x0 + 81, y0 + 8, P["roof"])
    L.rect(x0 - 4, y0 + 2, x0 + 81, y0 + 4, P["wood_hi"] if not night else P["wood"])
    for i, xx in enumerate(range(x0 - 4, x0 + 81, 6)):
        c = P["awn_a"] if i % 2 == 0 else P["awn_b"]
        L.rect(xx, y0 + 8, min(xx + 6, x0 + 81), y0 + 18, c)
        # scalloped bottom
        L.rect(xx + 1, y0 + 18, min(xx + 5, x0 + 81), y0 + 20, c)
        L.rect(xx, y0 + 15, min(xx + 6, x0 + 81), y0 + 16, P["awn_dk"] if i % 2 == 0 else P["awn_b"])
    # counter
    L.rect(x0 - 2, y0 + 48, x0 + 79, y0 + 54, P["counter_hi"])
    L.rect(x0 - 2, y0 + 54, x0 + 79, y0 + 64, P["counter"])
    for xx in range(x0, x0 + 78, 8): L.rect(xx, y0 + 55, xx + 1, y0 + 64, P["wood_dk"])
    L.rect(x0 - 2, y0 + 62, x0 + 79, y0 + 65, P["wood_dk"])
    # cloth + bowls on counter
    L.rect(x0 + 10, y0 + 46, x0 + 66, y0 + 49, P["cloth"])
    for bxx in (x0 + 16, x0 + 36, x0 + 56):
        L.rect(bxx, y0 + 41, bxx + 11, y0 + 46, P["bowl"]); L.rect(bxx + 2, y0 + 46, bxx + 9, y0 + 48, P["bowl"])
        L.rect(bxx + 1, y0 + 40, bxx + 10, y0 + 42, P["soup"])
    # lanterns hanging from awning
    for lx in (x0 + 8, x0 + 70):
        L.rect(lx + 2, y0 + 20, lx + 3, y0 + 26, P["wood_dk"])
        L.rect(lx - 1, y0 + 26, lx + 6, y0 + 34, P["lantern"])
        L.rect(lx, y0 + 27, lx + 3, y0 + 30, P["lantern_hi"])
        L.rect(lx + 1, y0 + 34, lx + 4, y0 + 36, P["wood_dk"])
    # table + stools, left of stall
    tx0, ty0 = x0 - 38, y0 + 50
    L.rect(tx0, ty0, tx0 + 26, ty0 + 4, P["wood_hi"]); L.rect(tx0, ty0 + 4, tx0 + 26, ty0 + 6, P["wood"])
    L.rect(tx0 + 3, ty0 + 6, tx0 + 6, ty0 + 20, P["wood_dk"]); L.rect(tx0 + 20, ty0 + 6, tx0 + 23, ty0 + 20, P["wood_dk"])
    L.rect(tx0 + 8, ty0 - 3, tx0 + 17, ty0, P["bowl"]); L.rect(tx0 + 9, ty0 - 4, tx0 + 16, ty0 - 2, P["soup"])
    for sxx in (tx0 - 8, tx0 + 28):
        L.rect(sxx, ty0 + 10, sxx + 8, ty0 + 13, P["stool"]); L.rect(sxx + 2, ty0 + 13, sxx + 4, ty0 + 20, P["wood_dk"]); L.rect(sxx + 5, ty0 + 13, sxx + 7, ty0 + 20, P["wood_dk"])
    if night:
        # baked lantern + window glow: dithered halos so the light stays pixel-art
        def halo(cx, cy, r, col, a):
            for y in range(cy - r, cy + r + 1):
                for x in range(cx - r, cx + r + 1):
                    d = math.hypot(x - cx, y - cy)
                    if d <= r and L.a[y, x][3] == 0:
                        v = (1 - d / r) * a
                        if v > BAYER[y % 4, x % 4] * 0.5: L.px(x, y, (col[0], col[1], col[2], int(60 + 90 * v)))
        for lx in (x0 + 8, x0 + 70): halo(lx + 2, y0 + 30, 22, (255, 176, 74), 0.9)
        halo(x0 + 27, y0 + 33, 24, (255, 210, 122), 0.7)
    L.save(f"warung-{theme}.png")

    # ---------- steam frames above the bowls ----------
    for fi in range(2):
        S = Layer()
        for bxx in (x0 + 16, x0 + 36, x0 + 56):
            for k in range(3):
                bx = bxx + 3 + k * 3
                for j in range(4):
                    wob = 1 if (j + fi + k) % 4 < 2 else 0
                    S.px(bx + wob, y0 + 38 - j * 2, (255, 255, 255, 170 - j * 40))
                    S.px(bx + wob, y0 + 37 - j * 2, (255, 255, 255, 170 - j * 40))
        S.save(f"steam{fi}-{theme}.png")

def band(theme):
    P = {k: (hexc(v) if isinstance(v, str) else v) for k, v in PAL[theme].items()}
    tones = [P["leaf_hi"], P["leaf1"], P["leaf2"], P["leaf3"]]
    # foliage mass hanging in from the right edge, with a branch and a few leaf clusters
    bw, bh = 140, 220
    L = Layer(bw, bh)
    m = disc_mask((bh, bw), [(150, 40, 46), (118, 70, 30), (140, 110, 38), (96, 40, 22), (124, 20, 28), (150, 160, 30), (112, 128, 20)])
    n2 = noise_grid(14, 5)
    er = m.copy()
    for y in range(bh):
        for x in range(bw):
            if m[y, x]:
                edge = any(not (0 <= x + dx < bw and 0 <= y + dy < bh) or not m[y + dy, x + dx] for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(2,0),(-2,0),(0,2),(0,-2)))
                er[y, x] = (not edge) or n2(x, y) > 0.4
    shade_mass(L, er, (0.7, 0.8), tones, 12, 1.1)
    L.save(f"band-tree-r-{theme}.png")
    # mirrored smaller foliage for the left edge
    L2 = Layer(bw, bh); L2.a = L.a[::-1, :, :][::-1][:, ::-1].copy()
    Image.fromarray(L2.a, "RGBA").resize((bw, bh)).save(os.path.join(OUT, f"band-tree-l-{theme}.png"))
    # small cumulus
    C = Layer(120, 50)
    discs = [(28, 30, 14), (50, 22, 18), (74, 28, 15), (96, 32, 11)]
    cm = disc_mask((50, 120), discs); cm[40:, :] = False
    ys, xs = np.nonzero(cm)
    for y, x in zip(ys, xs):
        t = (y - ys.min()) / max(1, ys.max() - ys.min())
        v = t * 1.2 + (BAYER[y % 4, x % 4] - 0.5) * 0.18
        C.px(int(x), int(y), P["cloud"] if v < .6 else P["cloud_shade"])
    C.save(f"band-cloud-{theme}.png")

for t in ("day", "night"): build(t); band(t)
print("ok", os.listdir(OUT))
