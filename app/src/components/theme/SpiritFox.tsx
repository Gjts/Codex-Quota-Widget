import type { QuotaStatus } from "@/types/quota";
import { STATUS_ACCENT } from "@/features/quota/copy";

type Eyes = "sparkle" | "open" | "half" | "worried" | "closed";
type Mouth = "smile" | "grin" | "neutral" | "open" | "sleep";

interface Mood {
  eyes: Eyes;
  mouth: Mouth;
  earDroop: number; // degrees
  aura: number; // 0-1 opacity
  zzz: boolean;
  sweat: boolean;
}

/** Maps each quota status to a SpiritFox facial expression / mood. */
const FOX_MOOD: Record<QuotaStatus, Mood> = {
  excellent: { eyes: "sparkle", mouth: "grin", earDroop: 0, aura: 0.95, zzz: false, sweat: false },
  normal: { eyes: "open", mouth: "smile", earDroop: 0, aura: 0.55, zzz: false, sweat: false },
  warning: { eyes: "half", mouth: "neutral", earDroop: 9, aura: 0.32, zzz: false, sweat: false },
  danger: { eyes: "worried", mouth: "open", earDroop: 15, aura: 0.28, zzz: false, sweat: true },
  exhausted: { eyes: "closed", mouth: "sleep", earDroop: 22, aura: 0, zzz: true, sweat: false },
  unknown: { eyes: "half", mouth: "neutral", earDroop: 6, aura: 0.2, zzz: false, sweat: false },
};

export interface SpiritFoxProps {
  status: QuotaStatus;
  size?: number;
  animate?: boolean;
  className?: string;
}

/**
 * 灵狐小管家 — a compact SVG nine-tailed spirit fox whose expression tracks the
 * current quota status. Pure SVG so it stays light and never janks the widget.
 */
export function SpiritFox({
  status,
  size = 72,
  animate = true,
  className = "",
}: SpiritFoxProps) {
  const mood = FOX_MOOD[status];
  const accent = STATUS_ACCENT[status];
  const fur = "#f7fbff";
  const furShade = "#dbeafe";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`灵狐 · ${status}`}
    >
      <defs>
        <radialGradient id={`aura-${status}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="70%" stopColor={accent} stopOpacity="0.15" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Spirit aura */}
      {mood.aura > 0 && (
        <circle
          cx="60"
          cy="64"
          r="56"
          fill={`url(#aura-${status})`}
          opacity={mood.aura}
          className={animate && status === "excellent" ? "animate-pulse" : ""}
        />
      )}

      {/* Nine-tail hint: a fan of fluffy tails behind the body */}
      <g opacity="0.95">
        {[-26, -10, 8].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 60 86)`}>
            <path
              d="M60 86 q-20 -8 -30 -30 q18 6 30 30 z"
              fill={i === 1 ? fur : furShade}
              stroke={accent}
              strokeWidth="1"
              strokeOpacity="0.5"
            />
            <path d="M40 60 q6 8 6 16" stroke={accent} strokeWidth="2" fill="none" strokeOpacity="0.6" />
          </g>
        ))}
      </g>

      {/* Body */}
      <ellipse cx="60" cy="92" rx="24" ry="18" fill={fur} stroke={furShade} strokeWidth="1.5" />

      {/* Ears (droop with worse status) */}
      {[-1, 1].map((dir) => (
        <g
          key={dir}
          transform={`rotate(${dir * mood.earDroop} ${60 + dir * 22} 40)`}
        >
          <path
            d={`M${60 + dir * 14} 44 L${60 + dir * 24} 14 L${60 + dir * 30} 46 Z`}
            fill={fur}
            stroke={furShade}
            strokeWidth="1.5"
          />
          <path
            d={`M${60 + dir * 17} 42 L${60 + dir * 24} 22 L${60 + dir * 27} 43 Z`}
            fill={accent}
            fillOpacity="0.55"
          />
        </g>
      ))}

      {/* Head */}
      <ellipse cx="60" cy="58" rx="30" ry="27" fill={fur} stroke={furShade} strokeWidth="1.5" />

      {/* Forehead rune */}
      <path
        d="M60 40 l5 6 -5 6 -5 -6 z"
        fill={accent}
        fillOpacity={status === "exhausted" ? 0.3 : 0.85}
      />

      {/* Cheeks / blush */}
      <ellipse cx="44" cy="64" rx="6" ry="4" fill={accent} fillOpacity="0.25" />
      <ellipse cx="76" cy="64" rx="6" ry="4" fill={accent} fillOpacity="0.25" />

      {/* Eyes */}
      <Eye x={49} type={mood.eyes} accent={accent} />
      <Eye x={71} type={mood.eyes} accent={accent} mirror />

      {/* Nose + mouth */}
      <path d="M60 64 l3 3 -3 2 -3 -2 z" fill="#475569" />
      <Mouth type={mood.mouth} />

      {/* Whiskers */}
      <g stroke={furShade} strokeWidth="1" strokeLinecap="round" opacity="0.8">
        <line x1="38" y1="62" x2="26" y2="60" />
        <line x1="38" y1="66" x2="26" y2="67" />
        <line x1="82" y1="62" x2="94" y2="60" />
        <line x1="82" y1="66" x2="94" y2="67" />
      </g>

      {/* Sweat drop (danger) */}
      {mood.sweat && (
        <path d="M86 50 q4 6 0 9 q-4 -3 0 -9 z" fill="#60a5fa" opacity="0.9" />
      )}

      {/* Zzz (exhausted) */}
      {mood.zzz && (
        <text
          x="92"
          y="34"
          fontSize="14"
          fill="#94a3b8"
          fontFamily="sans-serif"
          className={animate ? "animate-pulse" : ""}
        >
          z
        </text>
      )}
    </svg>
  );
}

function Eye({
  x,
  type,
  accent,
  mirror = false,
}: {
  x: number;
  type: Eyes;
  accent: string;
  mirror?: boolean;
}) {
  const y = 58;
  switch (type) {
    case "sparkle":
      return (
        <g>
          <circle cx={x} cy={y} r="5" fill="#0f172a" />
          <circle cx={x - 1.5} cy={y - 1.5} r="1.6" fill="#fff" />
          <circle cx={x + 1.5} cy={y + 1.5} r="0.9" fill={accent} />
        </g>
      );
    case "open":
      return (
        <g>
          <circle cx={x} cy={y} r="4.5" fill="#0f172a" />
          <circle cx={x - 1.3} cy={y - 1.3} r="1.4" fill="#fff" />
        </g>
      );
    case "half":
      return (
        <path
          d={`M${x - 5} ${y} q5 4 10 0`}
          stroke="#0f172a"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "worried":
      return (
        <g>
          <circle cx={x} cy={y + 1} r="4" fill="#0f172a" />
          <line
            x1={mirror ? x + 6 : x - 6}
            y1={y - 6}
            x2={mirror ? x - 2 : x + 2}
            y2={y - 4}
            stroke="#0f172a"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      );
    case "closed":
      return (
        <path
          d={`M${x - 5} ${y} q5 -4 10 0`}
          stroke="#475569"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      );
  }
}

function Mouth({ type }: { type: Mouth }) {
  switch (type) {
    case "grin":
      return <path d="M52 72 q8 9 16 0 q-8 4 -16 0 z" fill="#ef4444" fillOpacity="0.85" stroke="#475569" strokeWidth="1" />;
    case "smile":
      return <path d="M54 71 q6 6 12 0" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />;
    case "neutral":
      return <line x1="55" y1="72" x2="65" y2="72" stroke="#475569" strokeWidth="2" strokeLinecap="round" />;
    case "open":
      return <ellipse cx="60" cy="73" rx="4" ry="5" fill="#ef4444" fillOpacity="0.8" stroke="#475569" strokeWidth="1" />;
    case "sleep":
      return <path d="M56 72 q4 4 8 0" stroke="#475569" strokeWidth="1.6" fill="none" strokeLinecap="round" />;
  }
}
