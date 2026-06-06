export type ThemeName = "spiritFox" | "jadeToken" | "soulLamp" | "thunderCloud";
export type DisplayMode = "mini" | "standard" | "full";

export interface AppSettings {
  theme: ThemeName;
  displayMode: DisplayMode;
  alwaysOnTop: boolean;
  lockPosition: boolean;
  /** Mouse click-through (V1.0 feature; kept in the model now). */
  clickThrough: boolean;
  /** Window opacity 0.3 - 1. */
  opacity: number;
  /** Widget scale 0.8 - 1.5. */
  scale: number;
  autoStart: boolean;
  notificationsEnabled: boolean;
  animationEnabled: boolean;
  /** Toggle the 修仙 flavour text. */
  xianxiaCopyEnabled: boolean;
  /** Warning threshold (%), default 30. */
  warningThreshold: number;
  /** Danger threshold (%), default 15. Must stay below warningThreshold. */
  dangerThreshold: number;
  /** Auto-read local Codex quota via `codex app-server` on an interval. */
  autoReadEnabled: boolean;
  quotaRefreshIntervalMinutes: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "spiritFox",
  displayMode: "standard",
  alwaysOnTop: true,
  lockPosition: false,
  clickThrough: false,
  opacity: 0.95,
  scale: 1,
  autoStart: false,
  notificationsEnabled: true,
  animationEnabled: true,
  xianxiaCopyEnabled: true,
  warningThreshold: 30,
  dangerThreshold: 15,
  autoReadEnabled: true,
  quotaRefreshIntervalMinutes: 5,
};

/** Persisted widget window geometry (used from Phase 5). */
export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  monitorId?: string;
}
