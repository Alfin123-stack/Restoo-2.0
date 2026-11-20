import { BowlLogo } from "@/components/pixel/sprite";

const NODES = [
  "Warung",
  "Cafe",
  "Bakery",
  "Noodles",
  "Grill",
  "Fast food",
  "Halal",
  "Vegetarian",
] as const;

const RX = 38;
const RY = 34;

/** Hub diagram: the bowl in the middle, eight place types around it, dots travelling along the lines. */
export function HubDiagram() {
  const pts = NODES.map((label, i) => {
    const a = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
    return { label, x: 50 + RX * Math.cos(a), y: 50 + RY * Math.sin(a) };
  });
  return (
    <div className="relative aspect-[13/10] w-full" role="img" aria-label="Place types around the Restoo bowl">
      <svg viewBox="0 0 130 100" className="absolute inset-0 size-full" aria-hidden="true">
        <ellipse
          cx="65"
          cy="50"
          rx={RX * 1.3}
          ry={RY}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeDasharray="1 2"
          strokeWidth="0.4"
        />
        {pts.map((p, i) => (
          <g key={p.label}>
            <line
              x1="65"
              y1="50"
              x2={p.x * 1.3}
              y2={p.y}
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="0.35"
            />
            <rect className="hub-dot" width="1.6" height="1.6" rx="0.3" fill="#1a6fd1">
              <animateMotion
                dur={`${3.2 + (i % 3) * 0.6}s`}
                begin={`${i * 0.45}s`}
                repeatCount="indefinite"
                path={`M65 50 L${p.x * 1.3} ${p.y}`}
              />
            </rect>
          </g>
        ))}
      </svg>
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
        <div className="bg-raised flex size-14 items-center justify-center rounded-xl shadow-[0_0_2px_rgb(0_0_0/0.25),inset_0_2px_0_#fff] dark:shadow-none dark:ring-1 dark:ring-white/10">
          <BowlLogo scale={3} />
        </div>
        <span className="font-serif-mark text-heading text-lg leading-none">Restoo</span>
      </div>
      {pts.map((p) => (
        <span
          key={p.label}
          className="bg-raised text-terong-700 absolute -translate-x-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-[12px] whitespace-nowrap shadow-[0_0_2px_rgb(0_0_0/0.25),inset_0_1px_0_#fff] max-sm:px-1.5 max-sm:text-xs dark:shadow-none dark:ring-1 dark:ring-white/10"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          {p.label}
        </span>
      ))}
    </div>
  );
}
