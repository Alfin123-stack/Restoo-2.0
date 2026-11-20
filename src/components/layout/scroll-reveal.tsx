"use client";

import { useEffect } from "react";

/**
 * Scroll reveal for every page. Content is fully visible without JS. After hydration, elements
 * that start below the fold are held at "hidden" with a paused Web Animation, then fade and rise
 * in (text also loses a little blur) as they enter the viewport, staggered by position within the
 * same batch. Web Animations leave the DOM attributes untouched, so React hydration never
 * mismatches. A MutationObserver picks up streamed Suspense content and client navigations.
 */
const TARGETS = [
  "[data-rv]",
  "main h1",
  "main h2",
  "main h3",
  "main h2 + p",
  "main h1 + p",
  "main .px-box",
  "main .bg-raised",
  "main .bg-panel",
  "main article",
  "main figure",
  "main dl > div",
  "main ul.grid > li",
  "footer > div",
].join(",");
const SKIP = "[data-hero],[data-no-rv],[role=dialog]";
const TEXT = "H1,H2,H3,P";

export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const off = () =>
      root.dataset.motion === "off" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof IntersectionObserver === "undefined" || !("animate" in Element.prototype))
      return;

    const held = new WeakMap<Element, Animation[]>();
    const easing = "cubic-bezier(0.23, 1, 0.32, 1)";

    const hold = (el: HTMLElement) => {
      const text = TEXT.includes(el.tagName);
      const frames: Keyframe[] = [
        {
          opacity: 0,
          transform: "translateY(22px)",
          ...(text ? { filter: "blur(3px)" } : {}),
        },
        { opacity: 1, transform: "none", ...(text ? { filter: "blur(0px)" } : {}) },
      ];
      const list = [el.animate(frames, { duration: 800, easing, fill: "both" })];
      // Second tone of two-tone headings arrives a beat later.
      el.querySelectorAll(".tone-2").forEach((t) =>
        list.push(
          t.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 900,
            easing: "ease-out",
            fill: "both",
          }),
        ),
      );
      list.forEach((a, i) => {
        a.pause();
        a.currentTime = 0;
        a.onfinish = () => a.cancel();
        if (i > 0) a.effect?.updateTiming({ delay: 260 });
      });
      held.set(el, list);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left,
          );
        hit.forEach((e, i) => {
          const list = held.get(e.target);
          io.unobserve(e.target);
          if (!list) return;
          const d = Math.min(i, 5) * 90;
          list.forEach((a, j) => {
            a.effect?.updateTiming({ delay: d + (j > 0 ? 260 : 0) });
            a.play();
          });
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const scan = (scope: ParentNode) => {
      if (off()) return;
      const list: Element[] = [];
      if (scope instanceof Element && scope.matches(TARGETS)) list.push(scope);
      scope.querySelectorAll(TARGETS).forEach((el) => list.push(el));
      for (const el of list) {
        const h = el as HTMLElement;
        if (held.has(h) || !h.isConnected || h.closest(SKIP)) continue;
        // A held ancestor already animates this subtree.
        let skip = false;
        for (let p = h.parentElement; p; p = p.parentElement) {
          if (held.has(p)) {
            skip = true;
            break;
          }
        }
        if (skip) continue;
        const box = h.getBoundingClientRect();
        // Thin decorative strips and anything already on screen stay as they are.
        if (box.top < innerHeight * 0.92 || box.height < 64) {
          held.set(h, []);
          continue;
        }
        hold(h);
        io.observe(h);
      }
    };

    scan(document.body);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        // Drop held animations of nodes that left the page (client navigation).
        r.removedNodes.forEach((n) => {
          if (n instanceof Element)
            n.getAnimations({ subtree: true }).forEach(
              (a) => a.playState === "paused" && a.cancel(),
            );
        });
        r.addedNodes.forEach((n) => n instanceof Element && scan(n));
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
      // Strict mode / unmount: never leave content hidden behind a dead observer.
      document.getAnimations().forEach((a) => {
        if (a.playState === "paused") a.cancel();
      });
    };
  }, []);

  return null;
}
