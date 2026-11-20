"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Pixel confirmation built on the native <dialog>: focus trap, Esc to close, and backdrop come for free. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      aria-labelledby="confirm-title"
      className="px-box m-auto w-[min(92vw,28rem)] p-6 [--px-bg:var(--color-kartu)] backdrop:bg-black/60"
    >
      <h2 id="confirm-title" className="text-2xl">
        {title}
      </h2>
      <div className="text-terong-700 mt-3">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </dialog>
  );
}
