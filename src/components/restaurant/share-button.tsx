"use client";

import { useState } from "react";
import { PixelIcon } from "@/components/pixel/pixel-art";
import { shareLink } from "@/features/collections/share";

export function ShareButton({ path, title }: { path: string; title: string }) {
  const [message, setMessage] = useState("");

  const onClick = async () => {
    const result = await shareLink(`${window.location.origin}${path}`, title);
    if (result === "copied") setMessage("Link copied!");
    else if (result === "failed")
      setMessage("Couldn't share. Copy the link from the address bar.");
    else setMessage("");
    if (result !== "shared") setTimeout(() => setMessage(""), 3000);
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void onClick()}
        className="px-box px-press font-label inline-flex min-h-11 items-center gap-2 px-5 text-[15px] [--px-bg:var(--color-kartu)]"
      >
        <PixelIcon name="share" size={2} />
        Share
      </button>
      <span role="status" className="text-pandan-700 text-sm font-bold">
        {message}
      </span>
    </span>
  );
}
