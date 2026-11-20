"use client";

import { useEffect, useRef, useState } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { Button } from "@/components/ui/button";

/** Extracts the 11-character video id from watch, youtu.be and embed links; null if it is not one. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0] ?? null;
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = u.searchParams.get("v");
      const m = /^\/(?:embed|shorts|live)\/([^/?]+)/.exec(u.pathname);
      if (!id && m) id = m[1]!;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** "Watch the video": plays the recipe video in a popup. The player only loads once opened. */
export function VideoButton({ url, title }: { url: string; title: string }) {
  const id = youtubeId(url);
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // No usable video id: keep the plain link to YouTube.
  if (!id) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-light">
        <PixelIcon name="play" size={2} />
        Watch the video
      </a>
    );
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <PixelIcon name="play" size={2} />
        Watch the video
      </Button>
      <dialog
        ref={ref}
        aria-label={`Video: ${title}`}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false); // click on the backdrop
        }}
        className="bg-raised m-auto w-[min(96vw,56rem)] overflow-visible rounded-2xl p-3 backdrop:bg-black/70 sm:p-4"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-label min-w-0 truncate text-base">{title}</p>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            aria-label="Close video"
          >
            Close
          </Button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          {open ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
              title={`Video: ${title}`}
              className="size-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : null}
        </div>
        <p className="text-terong-700 mt-3 text-sm">
          Video not playing?{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
            Open it on YouTube
          </a>
        </p>
      </dialog>
    </>
  );
}
