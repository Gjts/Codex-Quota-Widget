import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Drives the per-second countdown refresh while the component is mounted.
 * Ticks once immediately so the UI never shows a stale value on first paint.
 */
export function useCountdownTick(intervalMs = 1000): void {
  const tick = useAppStore((s) => s.tick);
  useEffect(() => {
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs]);
}
