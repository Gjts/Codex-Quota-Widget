import { isTauri } from "@/lib/tauri";

let permissionPromise: Promise<boolean> | null = null;

/** Ensure desktop-notification permission (requested once, cached). */
export async function ensurePermission(): Promise<boolean> {
  if (!isTauri()) return false;
  if (!permissionPromise) {
    permissionPromise = (async () => {
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
    })();
  }
  return permissionPromise;
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
