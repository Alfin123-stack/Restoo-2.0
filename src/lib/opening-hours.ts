/**
 * Membaca jam buka format OSM ("Mo-Fr 08:00-17:00; Sa 09:00-14:00") dan teks sederhana
 * berbahasa Indonesia ("Setiap hari 08:00-21:00"). Waktu dihitung di zona Asia/Jakarta.
 */

export type OpenStatus = {
  state: "open" | "closed" | "unknown";
  label: string;
};

const DAY_ALIASES: Record<string, number> = {
  mo: 0,
  mon: 0,
  monday: 0,
  senin: 0,
  sen: 0,
  tu: 1,
  tue: 1,
  tuesday: 1,
  selasa: 1,
  sel: 1,
  we: 2,
  wed: 2,
  wednesday: 2,
  rabu: 2,
  rab: 2,
  th: 3,
  thu: 3,
  thursday: 3,
  kamis: 3,
  kam: 3,
  fr: 4,
  fri: 4,
  friday: 4,
  jumat: 4,
  "jum'at": 4,
  jum: 4,
  sa: 5,
  sat: 5,
  saturday: 5,
  sabtu: 5,
  sab: 5,
  su: 6,
  sun: 6,
  sunday: 6,
  minggu: 6,
  min: 6,
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

type Interval = [number, number]; // menit sejak 00:00; akhir boleh > 1440 untuk lewat tengah malam

function parseDays(text: string): number[] | null {
  const t = text.trim().toLowerCase();
  if (!t || /^(setiap hari|tiap hari|daily|every day|everyday|mo-su|sen-min)$/.test(t))
    return ALL_DAYS;
  const days = new Set<number>();
  for (const part of t.split(/[,&]/)) {
    const range = part.trim().split(/\s*-\s*/);
    const a = DAY_ALIASES[range[0]!.trim()];
    if (a === undefined) return null;
    if (range.length === 1) {
      days.add(a);
      continue;
    }
    const b = DAY_ALIASES[range[1]!.trim()];
    if (b === undefined) return null;
    for (let d = a; ; d = (d + 1) % 7) {
      days.add(d);
      if (d === b) break;
    }
  }
  return [...days];
}

function parseTimes(text: string): Interval[] | null {
  const t = text.trim().toLowerCase();
  if (/^(off|closed|tutup|libur)$/.test(t)) return [];
  if (/^(24\s*jam|24\/7|24 hours)$/.test(t)) return [[0, 1440]];
  const out: Interval[] = [];
  const rx = /(\d{1,2})[:.](\d{2})\s*(?:-|–|sampai|s\/d)\s*(\d{1,2})[:.](\d{2})/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(t))) {
    const start = Number(m[1]) * 60 + Number(m[2]);
    let end = Number(m[3]) * 60 + Number(m[4]);
    if (end <= start) end += 1440;
    out.push([start, end]);
  }
  return out.length ? out : null;
}

export function parseSchedule(raw: string): Map<number, Interval[]> | null {
  const text = raw.trim();
  if (!text) return null;
  if (/^(24\/7|24\s*jam|24 hours)$/i.test(text)) {
    return new Map(ALL_DAYS.map((d) => [d, [[0, 1440] as Interval]]));
  }
  const schedule = new Map<number, Interval[]>();
  for (const rule of text.split(";")) {
    const trimmed = rule.trim();
    if (!trimmed) continue;
    const idx = trimmed.search(/\d|\b(off|closed|tutup|libur)\b|24\/7|24\s*jam/i);
    if (idx < 0) return null;
    const days = parseDays(trimmed.slice(0, idx));
    const times = parseTimes(trimmed.slice(idx));
    if (!days || !times) return null;
    for (const d of days) schedule.set(d, times);
  }
  return schedule.size ? schedule : null;
}

function jakartaNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dayIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(
    get("weekday"),
  );
  return {
    day: dayIndex < 0 ? 0 : dayIndex,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

const fmt = (minutes: number) => {
  const m = minutes % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export function getOpenStatus(
  raw: string | null | undefined,
  now: Date = new Date(),
): OpenStatus {
  const unknown: OpenStatus = { state: "unknown", label: "Opening hours not listed" };
  if (!raw) return unknown;
  const schedule = parseSchedule(raw);
  if (!schedule) return unknown;

  const { day, minutes } = jakartaNow(now);
  const today = schedule.get(day) ?? [];
  const yesterday = schedule.get((day + 6) % 7) ?? [];

  // Sedang buka hari ini.
  for (const [start, end] of today) {
    if (minutes >= start && minutes < end) {
      return {
        state: "open",
        label: end - start >= 1440 ? "Open 24 hours" : `Open until ${fmt(end)}`,
      };
    }
  }
  // Masih buka karena jadwal kemarin lewat tengah malam.
  for (const [, end] of yesterday) {
    if (end > 1440 && minutes < end - 1440) {
      return { state: "open", label: `Open until ${fmt(end)}` };
    }
  }
  // Tutup: cari pembukaan berikutnya (hari ini, lalu 7 hari ke depan).
  const later = today.filter(([start]) => start > minutes).sort((a, b) => a[0] - b[0])[0];
  if (later) return { state: "closed", label: `Closed, opens at ${fmt(later[0])}` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const next = (schedule.get(d) ?? []).slice().sort((a, b) => a[0] - b[0])[0];
    if (next) {
      return {
        state: "closed",
        label:
          i === 1
            ? `Closed, opens tomorrow ${fmt(next[0])}`
            : `Closed, opens ${DAY_NAMES[d]} ${fmt(next[0])}`,
      };
    }
  }
  return { state: "closed", label: "Closed" };
}

export function isOpenNow(raw: string | null | undefined, now?: Date): boolean {
  return getOpenStatus(raw, now).state === "open";
}
