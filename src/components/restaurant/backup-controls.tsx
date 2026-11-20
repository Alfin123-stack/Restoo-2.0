"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { exportBackup, importBackup } from "@/features/backup";

/** Moves favorites and collections to another device (or back after clearing browser data). */
export function BackupControls() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<File | null>(null);

  return (
    <details className="group bg-panel rounded-2xl p-5">
      <summary className="font-label flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-base">
        <span>Move to another device</span>
        <span
          aria-hidden="true"
          className="text-terong-500 transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="space-y-4 pt-3">
        <p className="text-terong-700 text-sm leading-[1.4]">
          Your saved places stay on this device. Save a copy to open them on a new phone
          or computer, or to get them back after clearing your browser.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={exportBackup}>
            Save a copy
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Open a saved copy
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose a saved copy"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) setPending(file);
            }}
          />
        </div>
        <p role="status" aria-live="polite" className="min-h-6 text-sm">
          {message}
        </p>
      </div>
      <ConfirmDialog
        open={pending !== null}
        title="Add these saved places?"
        confirmLabel="Add them"
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          const file = pending;
          setPending(null);
          if (!file) return;
          try {
            const r = await importBackup(file);
            setMessage(
              `Added ${r.favorites} favorites and ${r.collections} collections.`,
            );
          } catch {
            setMessage("That file is not a copy saved from Restoo.");
          }
        }}
      >
        The places in this file are added to this device. Nothing you already saved is
        removed.
      </ConfirmDialog>
    </details>
  );
}
