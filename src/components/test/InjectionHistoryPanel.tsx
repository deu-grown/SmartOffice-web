// 세션 주입 이력 패널 — 최근 10건 표시, "지우기"로 초기화.
import { cn } from "@/lib/utils";
import type { InjectionLogEntry } from "@/src/features/testInjection/types";

interface InjectionHistoryPanelProps {
  entries: InjectionLogEntry[];
  onClear: () => void;
}

export function InjectionHistoryPanel({ entries, onClear }: InjectionHistoryPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-sm">주입 이력 (최근 {entries.length}건)</h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
          disabled={entries.length === 0}
        >
          지우기
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">주입 이력 없음</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-start gap-2 rounded-lg px-3 py-2 text-xs",
                entry.success
                  ? "bg-emerald-50 border border-emerald-100"
                  : "bg-red-50 border border-red-100",
              )}
            >
              <span
                className={cn(
                  "shrink-0 font-bold",
                  entry.success ? "text-emerald-600" : "text-red-500",
                )}
              >
                {entry.success ? "✓" : "✗"}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-700">[{entry.domain}]</span>{" "}
                <span className="text-gray-600">{entry.summary}</span>
              </div>
              <span className="shrink-0 text-gray-400">{entry.at.slice(11, 19)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
