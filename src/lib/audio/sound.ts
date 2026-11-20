/**
 * Sound for Restoo: warm and mechanical, matching the paper-and-brass look. Generated in code with the
 * Web Audio API (no audio files): wooden taps, kalimba-like plucks, a soft pad and a slow, gentle melody.
 * Rules: everything is OFF by default, nothing plays before the visitor turns it on (browsers block it anyway),
 * and nothing plays with `prefers-reduced-motion`, in a hidden tab, or above a low master volume.
 */
const KEY = "restoo-sound";
const MUSIC_KEY = "restoo-music";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const read = (k: string) => {
  try {
    return localStorage.getItem(k) === "on";
  } catch {
    return false;
  }
};
const write = (k: string, on: boolean) => {
  try {
    localStorage.setItem(k, on ? "on" : "off");
  } catch {
    /* storage unavailable */
  }
};

export const soundStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  isOn: () => read(KEY) && !reduced(),
  isMusicOn: () => read(KEY) && read(MUSIC_KEY) && !reduced(),
  server: () => false,
  setSound(on: boolean) {
    write(KEY, on);
    if (on) sfx("toggle");
    syncMusic();
    emit();
  },
  setMusic(on: boolean) {
    write(MUSIC_KEY, on);
    syncMusic();
    emit();
  },
};

function reduced() {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let fx: GainNode | null = null; // send bus into a soft echo
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (!soundStore.isOn()) return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.55;
    // Round off the top end so nothing sounds sharp.
    const soften = ctx.createBiquadFilter();
    soften.type = "lowpass";
    soften.frequency.value = 4200;
    master.connect(soften).connect(ctx.destination);
    // Warm echo: a short delay that repeats quietly, with each repeat a little duller.
    fx = ctx.createGain();
    fx.gain.value = 0.32;
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.34;
    const back = ctx.createGain();
    back.gain.value = 0.36;
    const dull = ctx.createBiquadFilter();
    dull.type = "lowpass";
    dull.frequency.value = 1800;
    fx.connect(delay);
    delay.connect(dull).connect(back).connect(delay);
    dull.connect(master);
    const len = Math.floor(ctx.sampleRate * 0.1);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended" && !document.hidden) void ctx.resume();
  return ctx;
}

/** Kalimba / music-box pluck: a soft sine plus a quiet bell overtone, fast attack, long gentle decay. */
function pluck(
  c: AudioContext,
  freq: number,
  start: number,
  dur: number,
  vol: number,
  dest: AudioNode = master!,
  echo = 0.5,
) {
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, start);
  out.gain.exponentialRampToValueAtTime(vol, start + 0.006);
  out.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  out.connect(dest);
  if (fx && echo > 0) {
    const send = c.createGain();
    send.gain.value = echo;
    out.connect(send).connect(fx);
  }
  const bell = c.createGain();
  bell.gain.setValueAtTime(0.28, start);
  bell.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.35);
  bell.connect(out);
  for (const [mult, node] of [
    [1, out],
    [2.76, bell],
  ] as const) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(freq * mult, start);
    o.connect(node);
    o.start(start);
    o.stop(start + dur + 0.05);
  }
}

/** Slow soft sine (pad / bass). */
function swell(
  c: AudioContext,
  freq: number,
  start: number,
  dur: number,
  vol: number,
  dest: AudioNode,
) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(vol, start + dur * 0.35);
  g.gain.linearRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(dest);
  o.start(start);
  o.stop(start + dur + 0.05);
}

/** Wooden tap: a short burst of filtered noise plus a low "thock". */
function tap(c: AudioContext, start: number, pitch: number, vol: number) {
  if (!noiseBuf) return;
  const n = c.createBufferSource();
  n.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = pitch;
  f.Q.value = 3;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + 0.06);
  n.connect(f).connect(g).connect(master!);
  n.start(start);
  n.stop(start + 0.08);
  const o = c.createOscillator();
  const og = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(pitch / 6, start);
  o.frequency.exponentialRampToValueAtTime(pitch / 12, start + 0.07);
  og.gain.setValueAtTime(vol * 0.9, start);
  og.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
  o.connect(og).connect(master!);
  o.start(start);
  o.stop(start + 0.1);
}

const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5,
};

export type Sfx = "click" | "save" | "tick" | "win" | "toggle";

export function sfx(name: Sfx) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  switch (name) {
    case "click":
      tap(c, t, 1500, 0.32);
      break;
    case "tick":
      tap(c, t, 2400 + Math.random() * 500, 0.2);
      break;
    case "save":
      pluck(c, NOTE.G5, t, 0.7, 0.3);
      pluck(c, NOTE.C6, t + 0.09, 0.9, 0.3);
      break;
    case "toggle":
      tap(c, t, 1100, 0.3);
      pluck(c, NOTE.E5, t + 0.04, 0.55, 0.22);
      break;
    case "win":
      [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6, NOTE.E6].forEach((f, i) =>
        pluck(c, f, t + i * 0.1, 1.1, 0.26),
      );
      break;
  }
}

/* ---- Background music: slow and warm. Soft chords underneath, a kalimba melody wandering on top. ---- */
const SCALE = [NOTE.C4, NOTE.D4, NOTE.E4, NOTE.G4, NOTE.A4, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5];
// C - Am - F - G, each held for 16 steps. [bass, pad notes]
const CHORDS: [number, number[]][] = [
  [65.41, [130.81, 196, 261.63, 329.63]],
  [55, [110, 164.81, 220, 261.63]],
  [43.65, [87.31, 130.81, 174.61, 220]],
  [49, [98, 146.83, 196, 246.94]],
];
const STEP = 60 / 68 / 2; // eighth note at 68 bpm
const CHORD_STEPS = 16;
let timer: ReturnType<typeof setInterval> | null = null;
let nextTime = 0;
let step = 0;
let pos = 4;
let musicGain: GainNode | null = null;

function startMusic() {
  const c = audio();
  if (!c || timer) return;
  musicGain = c.createGain();
  musicGain.gain.setValueAtTime(0.0001, c.currentTime);
  musicGain.gain.exponentialRampToValueAtTime(0.9, c.currentTime + 2);
  musicGain.connect(master!);
  nextTime = c.currentTime + 0.15;
  timer = setInterval(() => {
    if (!ctx || !musicGain) return;
    while (nextTime < ctx.currentTime + 0.5) {
      if (step % CHORD_STEPS === 0) {
        const [bass, pad] = CHORDS[(step / CHORD_STEPS) % CHORDS.length]!;
        const len = STEP * CHORD_STEPS * 1.15;
        swell(ctx, bass, nextTime, len, 0.16, musicGain);
        for (const f of pad) swell(ctx, f, nextTime, len, 0.05, musicGain);
      }
      // The melody walks up and down the scale, resting about a third of the time.
      if (step % 2 === 0 ? Math.random() < 0.8 : Math.random() < 0.35) {
        pos = Math.min(SCALE.length - 1, Math.max(0, pos + Math.round((Math.random() - 0.5) * 4)));
        pluck(ctx, SCALE[pos]!, nextTime, 1.6, 0.13, musicGain, 0.6);
      }
      nextTime += STEP;
      step++;
    }
  }, 120);
}

function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  if (ctx && musicGain) {
    const g = musicGain;
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    setTimeout(() => g.disconnect(), 700);
  }
  musicGain = null;
}

export function syncMusic() {
  if (soundStore.isMusicOn() && !document.hidden) startMusic();
  else stopMusic();
}

/** Pause everything when the tab is hidden. Called once from the layout. */
export function bindVisibility() {
  const onVis = () => {
    if (document.hidden) {
      stopMusic();
      void ctx?.suspend();
    } else {
      void ctx?.resume();
      syncMusic();
    }
  };
  document.addEventListener("visibilitychange", onVis);
  return () => document.removeEventListener("visibilitychange", onVis);
}
