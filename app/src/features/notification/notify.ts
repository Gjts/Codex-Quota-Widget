import { isTauri } from "@/lib/tauri";

let permissionPromise: Promise<boolean> | null = null;

/**
 * Ensure desktop-notification permission. A granted result is cached so we
 * never re-prompt; a denied/failed result is NOT cached, so a later call
 * (e.g. after the user grants it in system settings) can still succeed.
 */
export async function ensurePermission(): Promise<boolean> {
  if (!isTauri()) return false;
  if (!permissionPromise) {
    permissionPromise = requestNotificationPermission();
  }
  const granted = await permissionPromise;
  if (!granted) permissionPromise = null;
  return granted;
}

async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { isPermissionGranted, requestPermission } = await import(
      "@tauri-apps/plugin-notification"
    );
    let granted = await isPermissionGranted();
    if (!granted) granted = (await requestPermission()) === "granted";
    return granted;
  } catch (e) {
    console.error("[notify] permission failed", e);
    return false;
  }
}

/** Send a desktop notification (no-op outside Tauri / when not permitted). */
export async function notify(title: string, body: string): Promise<void> {
  if (!isTauri()) return;
  try {
    if (!(await ensurePermission())) return;
    const { sendNotification } = await import("@tauri-apps/plugin-notification");
    sendNotification({ title, body });
  } catch (e) {
    console.error("[notify] send failed", e);
  }
}
