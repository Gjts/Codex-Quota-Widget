import type { QuotaStatus } from "@/types/quota";
import { STATUS_ADVICE, STATUS_LABEL } from "@/features/quota/copy";

interface StatusTextProps {
  status: QuotaStatus;
  showAdvice?: boolean;
  showXianxiaCopy?: boolean;
}

/** "状态：灵力稳定" line plus an optional advice sentence. */
export function StatusText({
  status,
  showAdvice = true,
  showXianxiaCopy = true,
}: StatusTextProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-xs">
        <span className="opacity-70">状态：</span>
        <span className="font-semibold">{STATUS_LABEL[status]}</span>
      </div>
      {showAdvice && showXianxiaCopy && (
        <p className="text-[10px] leading-snug opacity-75">{STATUS_ADVICE[status]}</p>
      )}
    </div>
  );
}
