// 섹션4 근태 배치 트리거 — targetDate 지정, 오늘 날짜 버튼.
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAttendanceBatchInjection } from "@/src/features/testInjection/hooks";
import { nowLocalDateTime, todayDate } from "@/src/features/testInjection/seedData";
import type { InjectionLogEntry } from "@/src/features/testInjection/types";
import { ApiError } from "@/src/lib/api/types";
import { ROUTES } from "@/src/routes/paths";

interface Props {
  onLog: (entry: InjectionLogEntry) => void;
}

interface LastResult {
  success: boolean;
  text: string;
}

export function AttendanceBatchSection({ onLog }: Props) {
  const mutation = useAttendanceBatchInjection();
  const [targetDate, setTargetDate] = useState<string>(todayDate());
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  const handleRun = () => {
    if (!targetDate) { toast.error("날짜를 입력하세요."); return; }
    const at = nowLocalDateTime();
    mutation.mutate(
      { targetDate },
      {
        onSuccess: (count) => {
          const text = `${targetDate} 집계 완료 — ${count}건`;
          setLastResult({ success: true, text });
          toast.success(text);
          onLog({ id: crypto.randomUUID(), at, domain: "근태 배치", summary: text, success: true });
        },
        onError: (err) => {
          const msg = (err instanceof ApiError ? err.serverMessage : null) ?? "배치 실행 실패";
          setLastResult({ success: false, text: msg });
          toast.error(msg);
          onLog({ id: crypto.randomUUID(), at, domain: "근태 배치", summary: msg, success: false });
        },
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-gray-800">섹션4 — 근태 배치 (수동 트리거)</h3>
      <p className="text-xs text-gray-400">선행: 섹션1에서 NFC IN/OUT 주입 완료 후 실행하세요.</p>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-xs">집계 날짜</Label>
          <button
            type="button"
            className="text-xs text-blue-500 underline"
            onClick={() => setTargetDate(todayDate())}
          >
            오늘
          </button>
        </div>
        <Input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100"
        />
      </div>

      <Button
        onClick={handleRun}
        disabled={mutation.isPending}
        className="bg-black text-white hover:bg-black/90 rounded-xl h-9 text-xs"
      >
        {mutation.isPending ? "실행 중..." : "배치 실행"}
      </Button>

      {lastResult && (
        <div
          className={cn(
            "rounded-xl p-3 text-xs font-medium space-y-1",
            lastResult.success
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-600",
          )}
        >
          <p>{lastResult.text}</p>
          <Link to={ROUTES.PERSONNEL} className="underline text-blue-500 block">
            인사 관리 화면에서 확인 →
          </Link>
        </div>
      )}
    </div>
  );
}
