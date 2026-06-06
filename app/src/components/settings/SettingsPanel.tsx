import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { setPinned } from "@/lib/window";
import type { DisplayMode } from "@/types/settings";
import {
  isoToLocalInput,
  localInputToIso,
  validatePercent,
  validateThresholds,
} from "@/features/settings/validation";

const inputCls =
  "w-full rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-400/60";
const btnCls =
  "w-full rounded-md bg-cyan-500/80 px-2 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-cyan-400";

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const quota = useAppStore((s) => s.quota);
  const settings = useAppStore((s) => s.settings);
  const setQuota = useAppStore((s) => s.setQuota);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const numOrBlank = (n: number) => (Number.isNaN(n) ? "" : String(n));
  const [five, setFive] = useState(() => numOrBlank(quota.fiveHour.remainingPercent));
  const [fiveReset, setFiveReset] = useState(() => isoToLocalInput(quota.fiveHour.resetAt));
  const [week, setWeek] = useState(() => numOrBlank(quota.weekly.remainingPercent));
  const [weekReset, setWeekReset] = useState(() => isoToLocalInput(quota.weekly.resetAt));
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const saveQuota = () => {
    const f = validatePercent(five);
    const w = validatePercent(week);
    if (!f.ok) return setQuotaError(`灵力：${f.error}`);
    if (!w.ok) return setQuotaError(`道蕴：${w.error}`);
    setQuotaError(null);
    setQuota({
      fiveHourRemainingPercent: f.value,
      fiveHourResetAt: localInputToIso(fiveReset),
      weeklyRemainingPercent: w.value,
      weeklyResetAt: localInputToIso(weekReset),
      source: "manual",
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [warnInput, setWarnInput] = useState(settings.warningThreshold);
  const [dangerInput, setDangerInput] = useState(settings.dangerThreshold);
  // Buffer both threshold inputs locally so an intermediate invalid state
  // (e.g. danger >= warning while typing) is shown instead of being snapped
  // back; only a valid pair is committed to settings.
  const applyThresholds = (warning: number, danger: number) => {
    const v = validateThresholds(warning, danger);
    if (!v.ok) return setThresholdError(v.error ?? null);
    setThresholdError(null);
    updateSettings({ warningThreshold: warning, dangerThreshold: danger });
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-900/95 text-slate-100 backdrop-blur-md">
      <div
        data-tauri-drag-region
        className="flex items-center justify-between border-b border-white/10 px-3 py-2"
      >
        <span data-tauri-drag-region className="text-sm font-semibold text-cyan-200">
          ⚙ 设置
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-0.5 text-xs hover:bg-white/15"
        >
          返回 ✕
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-2 text-xs">
        <Section title="数据来源">
          <Toggle
            label="自动读取本机 Codex 额度"
            checked={settings.autoReadEnabled}
            onChange={(v) => updateSettings({ autoReadEnabled: v })}
          />
          {settings.autoReadEnabled && (
            <NumberField
              label="刷新间隔"
              suffix="分钟"
              value={settings.quotaRefreshIntervalMinutes}
              min={1}
              max={120}
              onChange={(v) =>
                updateSettings({ quotaRefreshIntervalMinutes: Math.max(1, v) })
              }
            />
          )}
          <p className="text-[10px] leading-snug opacity-60">
            {settings.autoReadEnabled
              ? "通过 codex app-server 定时读取并覆盖下方手动值；未装 Codex 或失败时自动回退手动。"
              : "已关闭：仅使用下方手动录入的额度。"}
          </p>
        </Section>

        <Section title="额度 · 手动录入">
          <Field label="灵力 · 5小时剩余 %">
            <input
              value={five}
              onChange={(e) => setFive(e.target.value)}
              placeholder="0–100，留空表示未知"
              inputMode="numeric"
              className={inputCls}
            />
          </Field>
          <Field label="灵力 · 复苏时间">
            <input
              type="datetime-local"
              value={fiveReset}
              onChange={(e) => setFiveReset(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="道蕴 · 每周剩余 %">
            <input
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              placeholder="0–100，留空表示未知"
              inputMode="numeric"
              className={inputCls}
            />
          </Field>
          <Field label="道蕴 · 轮回时间">
            <input
              type="datetime-local"
              value={weekReset}
              onChange={(e) => setWeekReset(e.target.value)}
              className={inputCls}
            />
          </Field>
          {quotaError && <p className="text-red-400">{quotaError}</p>}
          <button type="button" onClick={saveQuota} className={btnCls}>
            {saved ? "已保存 ✓" : "保存额度"}
          </button>
        </Section>

        <Section title="提醒阈值">
          <NumberField
            label={`警告阈值（真元偏弱）`}
            suffix={`${warnInput}%`}
            value={warnInput}
            min={1}
            max={100}
            onChange={(v) => {
              setWarnInput(v);
              applyThresholds(v, dangerInput);
            }}
          />
          <NumberField
            label={`危险阈值（道基不稳）`}
            suffix={`${dangerInput}%`}
            value={dangerInput}
            min={0}
            max={99}
            onChange={(v) => {
              setDangerInput(v);
              applyThresholds(warnInput, v);
            }}
          />
          {thresholdError && <p className="text-red-400">{thresholdError}</p>}
          <Toggle
            label="启用桌面通知"
            checked={settings.notificationsEnabled}
            onChange={(v) => updateSettings({ notificationsEnabled: v })}
          />
        </Section>

        <Section title="窗口与显示">
          <Field label="显示模式">
            <select
              value={settings.displayMode}
              onChange={(e) =>
                updateSettings({ displayMode: e.target.value as DisplayMode })
              }
              className={inputCls}
            >
              <option value="mini">迷你</option>
              <option value="standard">标准</option>
              <option value="full">完整</option>
            </select>
          </Field>
          <Field label={`透明度 ${Math.round(settings.opacity * 100)}%`}>
            <input
              type="range"
              min={30}
              max={100}
              value={Math.round(settings.opacity * 100)}
              onChange={(e) => updateSettings({ opacity: Number(e.target.value) / 100 })}
              className="w-full accent-cyan-400"
            />
          </Field>
          <Toggle
            label="始终置顶"
            checked={settings.alwaysOnTop}
            onChange={(v) => {
              updateSettings({ alwaysOnTop: v });
              void setPinned(v);
            }}
          />
        </Section>

        <Section title="主题">
          <Field label="皮肤">
            <select value={settings.theme} disabled className={inputCls}>
              <option value="spiritFox">灵狐小管家</option>
            </select>
          </Field>
          <Toggle
            label="启用动画"
            checked={settings.animationEnabled}
            onChange={(v) => updateSettings({ animationEnabled: v })}
          />
          <Toggle
            label="修仙文案"
            checked={settings.xianxiaCopyEnabled}
            onChange={(v) => updateSettings({ xianxiaCopyEnabled: v })}
          />
        </Section>

        <div className="pt-1 text-center text-[10px] opacity-50">
          Codex Quota Widget v0.1 · 灵狐小管家
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h2 className="text-[11px] font-semibold text-cyan-300/90">{title}</h2>
      <div className="space-y-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-2">
        {children}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-0.5">
      <span className="opacity-75">{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  suffix,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  suffix?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="opacity-75">
        {label} {suffix && <span className="opacity-60">{suffix}</span>}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-right text-xs outline-none focus:border-cyan-400/60"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="opacity-75">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-cyan-400"
      />
    </label>
  );
}
