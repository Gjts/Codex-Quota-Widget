import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { QuotaStatus } from "@/types/quota";
import { shouldNotify } from "./guard";
import { messageFor } from "./messages";
import { ensurePermission, notify } from "./notify";

/**
 * Watches both quota cycles and fires desktop notifications on worsening
 * transitions. "Armed" a moment after mount so the initial hydrate (which can
 * jump the status) never spams on startup.
 */
export function useQuotaNotifications(armDelayMs = 1500) {
  const fiveStatus = useAppStore((s) => s.quota.fiveHour.status);
  const weekStatus = useAppStore((s) => s.quota.weekly.status);
  const enabled = useAppStore((s) => s.settings.notificationsEnabled);
  const last = useRef<{ fiveHour?: QuotaStatus; weekly?: QuotaStatus }>({});
  const armed = useRef(false);

  useEffect(() => {
    void ensurePermission();
    const t = window.setTimeout(() => {
      armed.current = true;
    }, armDelayMs);
    return () => window.clearTimeout(t);
  }, [armDelayMs]);

  useEffect(() => {
    const prev = last.current.fiveHour;
    last.current.fiveHour = fiveStatus;
    if (armed.current && enabled && shouldNotify(prev, fiveStatus)) {
      const m = messageFor("fiveHour", fiveStatus);
      if (m) void notify(m.title, m.body);
    }
  }, [fiveStatus, enabled]);

  useEffect(() => {
    const prev = last.current.weekly;
    last.current.weekly = weekStatus;
    if (armed.current && enabled && shouldNotify(prev, weekStatus)) {
      const m = messageFor("weekly", weekStatus);
      if (m) void notify(m.title, m.body);
    }
  }, [weekStatus, enabled]);
}
