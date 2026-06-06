import { selectOverallStatus, useAppStore } from "@/store/useAppStore";
import { CYCLE_LABEL, STATUS_ACCENT, STATUS_CLASS } from "@/features/quota/copy";
import type { QuotaCycle, QuotaState, QuotaStatus } from "@/types/quota";
import type { AppSettings } from "@/types/settings";
import { SpiritFox } from "@/components/theme/SpiritFox";
import { RingGauge } from "./RingGauge";
import { QuotaBar } from "./QuotaBar";
import { StatusText } from "./StatusText";
import { WidgetActions } from "./WidgetActions";

interface FloatingWidgetProps {
  onOpenSettings: () => void;
  onClose: () => void;
  onTogglePin: () => void;
}

function pct(n: number): string {
  return Number.isNaN(n) ? "--" : `${Math.round(n)}%`;
}

/** The main desktop widget: 灵狐 mascot + 灵力 ring + 道蕴 bar + status. */
export function FloatingWidget({
  onOpenSettings,
  onClose,
  onTogglePin,
}: FloatingWidgetProps) {
  const quota = useAppStore((s) => s.quota);
  const settings = useAppStore((s) => s.settings);
  const syncError = useAppStore((s) => s.syncError);
  const overall = selectOverallStatus(quota);

  return (
    <div className="flex h-screen w-screen p-1.5">
      <div
        data-tauri-drag-region
        className={`relative flex h-full w-full flex-col gap-1 rounded-2xl border bg-slate-900/85 bg-gradient-to-br px-3 py-2 shadow-[0_0_36px_-10px] shadow-cyan-500/40 backdrop-blur-md ${
          STATUS_CLASS[overall]
        } ${overall === "danger" && settings.animationEnabled ? "animate-pulse" : ""}`}
        style={{ opacity: settings.opacity }}
      >
        {/* Title / drag bar + window controls */}
        <div data-tauri-drag-region className="flex items-center justify-between">
          <span
            data-tauri-drag-region
            className="flex items-center gap-1 text-[11px] font-semibold"
          >
            <span aria-hidden>🦊</span> 灵狐小管家
            {syncError && (
              <span
                title={syncError}
                aria-label={`自动读取异常：${syncError}`}
                className="cursor-help text-amber-300"
              >
                ⚠
              </span>
            )}
          </span>
          <WidgetActions
            pinned={settings.alwaysOnTop}
            onTogglePin={onTogglePin}
            onOpenSettings={onOpenSettings}
            onClose={onClose}
          />
        </div>

        {settings.displayMode === "mini" ? (
          <MiniBody quota={quota} overall={overall} settings={settings} />
        ) : settings.displayMode === "full" ? (
          <FullBody quota={quota} overall={overall} settings={settings} />
        ) : (
          <StandardBody quota={quota} overall={overall} settings={settings} />
        )}
      </div>
    </div>
  );
}

interface BodyProps {
  quota: QuotaState;
  overall: QuotaStatus;
  settings: AppSettings;
}

function StandardBody({ quota, overall, settings }: BodyProps) {
  return (
    <div data-tauri-drag-region className="flex flex-1 items-center gap-3">
      <div data-tauri-drag-region className="flex flex-col items-center gap-0.5">
        <RingGauge
          percent={quota.fiveHour.remainingPercent}
          accent={STATUS_ACCENT[quota.fiveHour.status]}
          label={CYCLE_LABEL.fiveHour}
          size={72}
        />
        <div className="text-[10px] opacity-75">
          复苏 <span className="tabular-nums">{quota.fiveHour.resetCountdownText}</span>
        </div>
      </div>
      <div data-tauri-drag-region className="flex flex-1 flex-col gap-1.5">
        <QuotaBar
          percent={quota.weekly.remainingPercent}
          accent={STATUS_ACCENT[quota.weekly.status]}
          label={CYCLE_LABEL.weekly}
          countdownLabel="轮回"
          countdown={quota.weekly.resetCountdownText}
        />
        <div className="flex items-center gap-1.5">
          <SpiritFox status={overall} size={46} animate={settings.animationEnabled} />
          <StatusText status={overall} showXianxiaCopy={settings.xianxiaCopyEnabled} />
        </div>
      </div>
    </div>
  );
}

function MiniBody({ quota, overall, settings }: BodyProps) {
  return (
    <div data-tauri-drag-region className="flex flex-1 items-center justify-center gap-2">
      <SpiritFox status={overall} size={42} animate={settings.animationEnabled} />
      <div className="text-xl font-bold tabular-nums">
        {pct(quota.fiveHour.remainingPercent)}{" "}
        <span className="opacity-50">/</span> {pct(quota.weekly.remainingPercent)}
      </div>
    </div>
  );
}

function FullBody({ quota, overall, settings }: BodyProps) {
  return (
    <div data-tauri-drag-region className="flex flex-1 gap-2">
      <SpiritFox status={overall} size={54} animate={settings.animationEnabled} />
      <div className="flex flex-1 flex-col justify-center gap-1">
        <CycleRow label="小周天灵力" cycle={quota.fiveHour} resetLabel="复苏" />
        <CycleRow label="大周天道蕴" cycle={quota.weekly} resetLabel="轮回" />
        <StatusText status={overall} showXianxiaCopy={settings.xianxiaCopyEnabled} />
      </div>
    </div>
  );
}

function CycleRow({
  label,
  cycle,
  resetLabel,
}: {
  label: string;
  cycle: QuotaCycle;
  resetLabel: string;
}) {
  return (
    <div className="flex items-center justify-between text-[10px]">
      <span className="opacity-80">{label}</span>
      <span className="tabular-nums">
        <span className="font-semibold">{pct(cycle.remainingPercent)}</span>
        <span className="opacity-60">
          {" "}
          · {resetLabel} {cycle.resetCountdownText}
        </span>
      </span>
    </div>
  );
}
