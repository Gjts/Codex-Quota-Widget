import { isTauri } from "./tauri";

/**
 * Thin, browser-safe wrappers around the Tauri window API. Each is a no-op when
 * not running inside Tauri, so `pnpm dev` in a browser never throws. The Tauri
 * modules are imported dynamically so the browser bundle stays clean.
 */
async function currentWindow() {
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  return getCurrentWindow();
}

export async function minimizeWidget(): Promise<void> {
  if (!isTauri()) return;
  await (await currentWindow()).minimize();
}

export async function hideWidget(): Promise<void> {
  if (!isTauri()) return;
  await (await currentWindow()).hide();
}

export async function showWidget(): Promise<void> {
  if (!isTauri()) return;
  const w = await currentWindow();
  await w.show();
  await w.setFocus();
}

export async function setPinned(pinned: boolean): Promise<void> {
  if (!isTauri()) return;
  await (await currentWindow()).setAlwaysOnTop(pinned);
}

export async function setWidgetSize(width: number, height: number): Promise<void> {
  if (!isTauri()) return;
  const { LogicalSize } = await import("@tauri-apps/api/dpi");
  await (await currentWindow()).setSize(new LogicalSize(width, height));
}
