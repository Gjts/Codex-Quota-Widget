import type { QuotaStatus } from "@/types/quota";

export type NotifyCycle = "fiveHour" | "weekly";

export interface NotificationMessage {
  title: string;
  body: string;
}

/** 修仙风通知文案，按 `${cycle}-${status}` 取用。 */
export const NOTIFICATION_MESSAGES: Record<string, NotificationMessage> = {
  "fiveHour-warning": {
    title: "Codex 灵力偏低",
    body: "灵力不足 30%，建议谨慎开阵。",
  },
  "fiveHour-danger": {
    title: "Codex 道基不稳",
    body: "灵力不足 15%，再召唤几次可能进入闭关恢复。",
  },
  "fiveHour-exhausted": {
    title: "Codex 灵脉枯竭",
    body: "5小时额度已耗尽，请等待灵脉复苏。",
  },
  "weekly-warning": {
    title: "本周道蕴偏低",
    body: "本周道蕴消耗偏快，请留给关键任务。",
  },
  "weekly-danger": {
    title: "本周道蕴告急",
    body: "本周额度不足 15%，建议留给真正关键的问题。",
  },
  "weekly-exhausted": {
    title: "本周道蕴耗尽",
    body: "本周额度已耗尽，建议闭关整理需求文档。",
  },
};

export function messageFor(
  cycle: NotifyCycle,
  status: QuotaStatus,
): NotificationMessage | null {
  return NOTIFICATION_MESSAGES[`${cycle}-${status}`] ?? null;
}
