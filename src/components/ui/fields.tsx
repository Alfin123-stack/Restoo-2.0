import { cn } from "@/lib/utils";

/** Classes for inset-style inputs, selects, and textareas. */
export const fieldClass = cn(
  "px-field min-h-12 w-full px-4 py-2 text-base text-krem placeholder:text-terong-500",
  "aria-[invalid=true]:[--px-ink:var(--color-cabai-600)]",
);

export const labelClass = "mb-2 block font-label text-[13px] uppercase tracking-wider";

/** Label above, optional hint and error below. Wires aria-describedby for you. */
export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => React.ReactNode;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-cabai-700 mt-2 text-sm font-bold">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-terong-700 mt-2 text-sm">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
