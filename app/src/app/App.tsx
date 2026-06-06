import { useEffect, useRef, useState } from "react";
import { FloatingWidget } from "@/components/widget/FloatingWidget";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { useAppStore } from "@/store/useAppStore";
import { useCountdownTick } from "@/features/quota/useCountdownTick";
import { useQuotaNotifications } from "@/features/notification/useQuotaNotifications";
import { hideWidget, setPinned, setWidgetSize } from "@/lib/window";
import { isTauri } from "@/lib/tauri";
import {
  fromPersistedQuota,
  loadPersisted,
  persist,
  toPersistedQuota,
} from "@/features/persistence/repository";

type View = "widget" | "settings";

const WIDGET_SIZE: [number, number] = [280, 180];
const SETTINGS_SIZE: [number, number] = [320, 500];

export default function App() {
  const [view, setView] = useState<View>("widget");
  // Countdown keeps ticking regardless of which view is shown.
  useCountdownTick();
  // Low-quota desktop notifications (armed after hydrate to avoid startup spam).
  useQuotaNotifications();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const hydrate = useAppStore((s) => s.hydrate);
  const hydratedRef = useRef(false);

  // Load persisted settings + quota on startup.
  useEffect(() => {
    let active = true;
    loadPersisted().then(({ settings: ps, quota: pq }) => {
      if (!active) return;
      const base = ps ?? useAppStore.getState().settings;
      hydrate({
        settings: ps,
        quota: pq ? fromPersistedQuota(pq, base) : undefined,
      });
      hydratedRef.current = true;
    });
    return () => {
      active = false;
    };
  }, [hydrate]);

  // Persist on meaningful changes — debounced, skips per-second countdown ticks.
  useEffect(() => {
    let lastSnap = "";
    let timer: number | undefined;
    const unsub = useAppStore.subscribe((state) => {
      if (!hydratedRef.current) return;
      const snap = JSON.stringify({
        s: state.settings,
        q: toPersistedQuota(state.quota),
      });
      if (snap === lastSnap) return;
      lastSnap = snap;
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => void persist(state.settings, state.quota),
        400,
      );
    });
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  // React to system-tray menu actions.
  useEffect(() => {
    if (!isTauri()) return;
    let cancelled = false;
    const unlisteners: Array<() => void> = [];
    (async () => {
      const { listen } = await import("@tauri-apps/api/event");
      const u1 = await listen("tray://open-settings", () => {
        void setWidgetSize(...SETTINGS_SIZE);
        setView("settings");
      });
      const u2 = await listen("tray://refresh", async () => {
        const { settings: ps, quota: pq } = await loadPersisted();
        const base = ps ?? useAppStore.getState().settings;
        hydrate({
          settings: ps,
          quota: pq ? fromPersistedQuota(pq, base) : undefined,
        });
      });
      if (cancelled) {
        u1();
        u2();
      } else {
        unlisteners.push(u1, u2);
      }
    })();
    return () => {
      cancelled = true;
      unlisteners.forEach((u) => u());
    };
  }, [hydrate]);

  const openSettings = () => {
    void setWidgetSize(...SETTINGS_SIZE);
    setView("settings");
  };

  const closeSettings = () => {
    void setWidgetSize(...WIDGET_SIZE);
    setView("widget");
  };

  const togglePin = () => {
    const next = !settings.alwaysOnTop;
    updateSettings({ alwaysOnTop: next });
    void setPinned(next);
  };

  if (view === "settings") {
    return <SettingsPanel onClose={closeSettings} />;
  }

  return (
    <FloatingWidget
      onOpenSettings={openSettings}
      onClose={() => void hideWidget()}
      onTogglePin={togglePin}
    />
  );
}
