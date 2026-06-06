import type { QuotaStatus } from "@/types/quota";

/** Cycle display names. */
export const CYCLE_LABEL = {
  fiveHour: "灵力",
  weekly: "道蕴",
} as const;

/** Short status name shown under the widget (修仙文案). */
export const STATUS_LABEL: Record<QuotaStatus, string> = {
  excellent: "灵气充盈",
  normal: "灵力稳定",
  warning: "真元偏弱",
  danger: "道基不稳",
  exhausted: "灵脉枯竭",
  unknown: "灵识未明",
};

/** One-line advice shown in standard/full modes. */
export const STATUS_ADVICE: Record<QuotaStatus, string> = {
  excellent: "灵脉充盈，今日可放心召唤 Codex。",
  normal: "灵力稳定，适合处理中型任务。",
  warning: "真元偏弱，建议先处理小任务。",
  danger: "道基不稳，再召唤几次可能进入闭关恢复。",
  exhausted: "灵脉枯竭，可先整理需求，等待复苏。",
  unknown: "尚未录入额度，点击齿轮开始登记。",
};

/** Tailwind classes per status — drives the widget's visual state. */
export const STATUS_CLASS: Record<QuotaStatus, string> = {
  excellent: "from-amber-200/20 to-amber-400/10 border-amber-300/50 text-amber-100",
  normal: "from-cyan-400/15 to-sky-500/10 border-cyan-400/40 text-cyan-50",
  warning: "from-orange-400/15 to-orange-600/10 border-orange-400/50 text-orange-100",
  danger: "from-red-500/20 to-red-700/15 border-red-500/60 text-red-100",
  exhausted: "from-zinc-600/20 to-zinc-800/20 border-zinc-600/50 text-zinc-300 grayscale",
  unknown: "from-slate-500/15 to-slate-700/10 border-slate-500/40 text-slate-200",
};

/** Accent color (used by rings/bars) per status. */
export const STATUS_ACCENT: Record<QuotaStatus, string> = {
  excellent: "#fcd34d",
  normal: "#38e1ff",
  warning: "#fb923c",
  danger: "#f87171",
  exhausted: "#a1a1aa",
  unknown: "#94a3b8",
};
