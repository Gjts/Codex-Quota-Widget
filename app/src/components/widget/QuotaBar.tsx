interface QuotaBarProps {
  /** 0-100, or NaN for unknown. */
  percent: number;
  accent: string;
  label: string;
  countdownLabel: string;
  countdown: string;
}

/** Horizontal quota bar with a label, percentage and reset countdown (道蕴). */
export function QuotaBar({
  percent,
  accent,
  label,
  countdownLabel,
  countdown,
}: QuotaBarProps) {
  const known = !Number.isNaN(percent);
  const value = known ? Math.max(0, Math.min(100, percent)) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span className="font-bold tabular-nums">{known ? `${Math.round(value)}%` : "--"}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${accent}aa, ${accent})`,
            transition: "width 0.6s ease, background 0.4s ease",
          }}
        />
      </div>
      <div className="flex items-center gap-1 text-[10px] opacity-75">
        <span>{countdownLabel}</span>
        <span className="font-medium tabular-nums">{countdown}</span>
      </div>
    </div>
  );
}
