"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

/** Thin stepped pixel bar under the header while a navigation is loading. */
function Bar() {
  const pathname = usePathname();
  const key = `${pathname}?${useSearchParams().toString()}`;
  // The key that was current when a navigation started; the bar runs until the key changes.
  const [from, setFrom] = useState<string | null>(null);
  const keyRef = useRef(key);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    keyRef.current = key;
    if (from === null || from === key) return; // still loading: keep running
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFrom(null), 450);
    return () => clearTimeout(timer.current);
  }, [key, from]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey)
        return;
      const a = (e.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setFrom(keyRef.current);
    };
    // Capture phase: Next's Link calls preventDefault() before the event bubbles up here.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (from === null) return null;
  return (
    <div
      aria-hidden="true"
      className="route-progress pointer-events-none fixed inset-x-0 top-0 z-[60]"
      data-state={from === key ? "run" : "done"}
    />
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
