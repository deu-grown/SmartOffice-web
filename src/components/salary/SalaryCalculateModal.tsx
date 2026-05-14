// 급여 산출 모달 — features/salary 흡수 (묶음 3 커밋 3.2).
// 위험 액션. AttendanceBatchTriggerButton(personnel/AttendanceTab.tsx:254) 패턴 적용:
// ① 멱등성 라벨 ② 확인 모달(year/month + RUN 입력) ③ 결과 모달(처리/스킵 건수) ④ 실패 시 토스트 + 모달 유지.
import { useState } from "react";
import { AlertTriangle, Calculator, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useCalculateSalary } from "@/src/features/salary/hooks";
import type { SalaryCalculateResponse } from "@/src/features/salary/types";

interface SalaryCalculateModalProps {
  open: boolean;
  onClose: () => void;
  defaultYear: number;
  defaultMonth: number;
}

export function SalaryCalculateModal({ open, onClose, defaultYear, defaultMonth }: SalaryCalculateModalProps) {
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [confirmText, setConfirmText] = useState("");
  const [result, setResult] = useState<SalaryCalculateResponse | null>(null);

  const calculateMutation = useCalculateSalary();

  const handleRun = () => {
    calculateMutation.mutate(
      { year, month },
      {
        onSuccess: (res) => {
          setResult(res);
          setConfirmText("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "급여 산출에 실패했습니다.");
          // 모달 유지 (재시도 가능)
        },
      }
    );
  };

  const handleClose = () => {
    setResult(null);
    setConfirmText("");
    onClose();
  };

  if (!open) return null;

  // 결과 모달 단계 ③
  if (result) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">급여 산출 완료</h2>
            <p className="text-sm text-gray-400 mt-1">
              {year}년 {month}월
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">대상</p>
              <p className="text-2xl font-black font-mono mt-1">{result.totalCount}</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">성공</p>
              <p className="text-2xl font-black font-mono mt-1 text-green-600">{result.successCount}</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">스킵</p>
              <p className="text-2xl font-black font-mono mt-1 text-yellow-600">{result.skipCount}</p>
            </div>
          </div>
          {result.skipCount > 0 && (
            <p className="text-xs text-gray-500">
              CONFIRMED 상태의 {result.skipCount}건은 재계산되지 않았습니다.
            </p>
          )}
          <Button onClick={handleClose} className="w-full h-12 rounded-2xl font-bold bg-black text-white hover:bg-black/90">
            닫기
          </Button>
        </div>
      </div>
    );
  }

  // 확인 모달 단계 ② (① 멱등성 라벨 포함)
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">급여 산출 (위험 액션)</h2>
            <p className="text-[11px] text-red-500 font-bold flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3" />
              기존 DRAFT 산출 결과를 덮어씁니다 (멱등 X — CONFIRMED 는 스킵)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-400">연도</Label>
            <Input type="number" min={2020} max={2099} value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-12 rounded-2xl font-mono" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-400">월</Label>
            <Input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} className="h-12 rounded-2xl font-mono" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-gray-400">실행하려면 아래에 `RUN` 을 입력하세요</Label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="h-12 rounded-2xl font-mono"
            placeholder="RUN"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={calculateMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold">
            취소
          </Button>
          <Button
            onClick={handleRun}
            disabled={calculateMutation.isPending || confirmText !== "RUN"}
            className="flex-1 h-12 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
          >
            {calculateMutation.isPending ? "실행 중..." : "산출 실행"}
          </Button>
        </div>
      </div>
    </div>
  );
}
