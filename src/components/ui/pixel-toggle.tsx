import { cn } from "@/lib/utils";

/** Pixel on/off switch built on a real checkbox, so keyboard, forms and screen readers keep working. */
export function PixelToggle({
  label,
  name,
  value,
  checked,
  defaultChecked,
  onChange,
  className,
}: {
  label: string;
  name?: string;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "font-label flex min-h-12 cursor-pointer items-center gap-3 text-[13px] tracking-wider uppercase",
        className,
      )}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="px-flat peer-focus-visible:outline-kunyit-400 relative block h-8 w-14 shrink-0 transition-colors [--px-bg:var(--color-malam)] peer-checked:[--px-bg:var(--color-pandan-500)] peer-focus-visible:outline-4 peer-focus-visible:outline-offset-4 peer-checked:[&>span]:translate-x-6"
      >
        <span className="bg-krem absolute top-1 left-1 block size-6 shadow-[inset_0_-4px_0_rgb(0_0_0/0.2)] transition-transform duration-100 [transition-timing-function:steps(3)]" />
      </span>
      {label}
    </label>
  );
}
