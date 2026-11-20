"use client";

import { useSyncExternalStore } from "react";
import { Mascot } from "@/components/pixel/sprite";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineIndicator() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  if (online) return null;
  return (
    <div
      role="status"
      className="px-box wipe-in fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-xl items-center gap-4 p-3 [--px-bg:var(--color-footer)] [--px-ink:var(--color-kunyit-400)]"
    >
      <Mascot mood="sad" scale={3} />
      <p className="text-onink text-sm">
        <span className="font-eyebrow text-kunyit-400 block text-xs uppercase">
          Connection lost
        </span>
        You are offline. Your favorites and collections still work.
      </p>
    </div>
  );
}
