"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { askMeong, identifyDish } from "@/actions/ai";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Cheap halal place open now",
  "Cafe with wifi to work",
  "Outdoor seating for dinner",
];

type SpeechCtor = new () => {
  lang: string;
  interimResults: boolean;
  onresult:
    ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/** Downscales a photo in the browser so the upload stays small (and private data in EXIF is dropped). */
async function toSmallJpeg(file: File): Promise<{ data: string; mime: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/jpeg", 0.8);
  return { data: url.split(",")[1] ?? "", mime: "image/jpeg" };
}

/**
 * Ask Meong: describe what you feel like eating (typed, spoken, or as a photo of a dish)
 * and land on /restaurants with the matching filters already applied.
 */
export function AskMeong({
  aiOn,
  className,
  autoFocus = false,
}: {
  /** True when a Gemini key is configured on the server. */
  aiOn: boolean;
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<InstanceType<SpeechCtor> | null>(null);

  const canSpeak = useSyncExternalStore(
    () => () => {},
    () => {
      const w = window as unknown as {
        SpeechRecognition?: SpeechCtor;
        webkitSpeechRecognition?: SpeechCtor;
      };
      return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
    },
    () => false,
  );

  useEffect(() => () => recRef.current?.stop(), []);

  const go = (params: Record<string, string>, summary?: string) => {
    const qs = new URLSearchParams(params);
    if (summary) qs.set("ask", summary);
    router.push(`/restaurants?${qs}` as Route);
  };

  const submit = (value = text) => {
    const q = value.trim();
    if (q.length < 2) {
      setError("Tell Meong what you feel like eating.");
      return;
    }
    setError("");
    start(async () => {
      const result = await askMeong(q);
      if (result.ok) go(result.params, result.summary);
      else setError(result.message);
    });
  };

  const listen = () => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = document.documentElement.lang === "id" ? "id-ID" : "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const heard = e.results[0]?.[0]?.transcript ?? "";
      setText(heard);
      if (heard) submit(heard);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      setError("Couldn't hear you. Check microphone permission and try again.");
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const onPhoto = (file: File | undefined) => {
    if (!file) return;
    setError("");
    start(async () => {
      try {
        const { data, mime } = await toSmallJpeg(file);
        const result = await identifyDish(data, mime);
        if (result.ok) go(result.params, `places serving ${result.dish.toLowerCase()}`);
        else setError(result.message);
      } catch {
        setError("Couldn't read that photo. Try another one.");
      }
    });
  };

  return (
    <div className={className}>
      <form
        role="search"
        aria-label="Ask Meong"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="px-field flex flex-wrap items-center gap-2 p-2"
      >
        <label htmlFor={id} className="sr-only">
          Describe what you feel like eating
        </label>
        <div className="relative min-w-52 flex-1 basis-full sm:basis-0">
          <PixelIcon
            name="search"
            size={3}
            className="text-terong-500 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            id={id}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            autoFocus={autoFocus}
            placeholder="Try: cheap halal place open now"
            className="placeholder:text-terong-500 min-h-12 w-full bg-transparent pr-2 pl-12 text-base outline-none"
            aria-describedby={`${id}-hint`}
          />
        </div>
        {canSpeak ? (
          <Button
            type="button"
            variant="secondary"
            className="min-h-11"
            onClick={listen}
            aria-pressed={listening}
            aria-label={listening ? "Stop listening" : "Speak your request"}
            title="Speak"
          >
            {listening ? "Listening…" : "Mic"}
          </Button>
        ) : null}
        {aiOn ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="sr-only"
              tabIndex={-1}
              aria-label="Choose a photo of a dish"
              onChange={(e) => {
                onPhoto(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              onClick={() => fileRef.current?.click()}
              title="Search by a photo of a dish"
            >
              Photo
            </Button>
          </>
        ) : null}
        <Button type="submit" disabled={pending} className="min-h-11">
          {pending ? "Thinking…" : "Ask Meong"}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3" id={`${id}-hint`}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            disabled={pending}
            onClick={() => {
              setText(ex);
              submit(ex);
            }}
            className="px-box px-press min-h-11 px-3 text-sm [--px-bg:var(--color-kartu)]"
          >
            {ex}
          </button>
        ))}
      </div>
      <p
        role="status"
        aria-live="polite"
        className={cn("mt-3 text-sm", error && "text-cabai-700")}
      >
        {error ||
          (pending
            ? "Meong is thinking…"
            : aiOn
              ? "Meong only suggests places from our list."
              : "Tip: short keywords work best, like “cheap halal” or “wifi cafe”.")}
      </p>
    </div>
  );
}
