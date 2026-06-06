interface RingGaugeProps {
  /** 0-100, or NaN for unknown. */
  percent: number;
  accent: string;
  label: string;
  size?: number;
  stroke?: number;
}

/** Circular progress ring with the percentage in the centre (灵力 gauge). */
export function RingGauge({
  percent,
  accent,
  label,
  size = 76,
  stroke = 8,
}: RingGaugeProps) {
  const known = !Number.isNaN(percent);
  const value = known ? Math.max(0, Math.min(100, percent)) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={stroke}
        />
        {known && (
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-[10px] font-medium opacity-70">{label}</span>
        <span className="text-lg font-bold tabular-nums">
          {known ? `${Math.round(value)}%` : "--"}
        </span>
      </div>
    </div>
  );
}
