// 전력 요금 산출 모달 — 위험 액션 (멱등 X, 기존 내역 덮어쓰기).
// 묶음 4 커밋 4.3. AttendanceBatchTriggerButton(personnel/AttendanceTab.tsx:254) 패턴 적용:
// ① 멱등성 라벨 ② 확인 모달(year/month/unitPrice/baseFee + RUN) ③ 결과 모달(건수/총액) ④ 실패 시 토스트.
import { useState } from "react";
import { AlertTriangle, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useCalculatePowerBilling } from "@/src/features/power/hooks";
import type { PowerBillingCalculateResponse } from "@/src/features/power/types";

interface PowerBillingCalculateModalProps {
  open: boolean;
  onClose: () => void;
  defaultYear: number;
  defaultMonth: number;
}

function formatKrw(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n);
}

export function PowerBillingCalculateModal({ open, onClose, defaultYear, defaultMonth }: PowerBillingCalculateModalProps) {
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [unitPrice, setUnitPrice] = useState(200);
  const [baseFee, setBaseFee] = useState(5000);
  const [confirmText, setConfirmText] = useState("");
  const [result, setResult] = useState<PowerBillingCalculateResponse | null>(null);

  const calculateMutation = useCalculatePowerBilling();

  const handleRun = () => {
    calculateMutation.mutate(
      { year, month, unitPrice, baseFee },
      {
        onSuccess: (res) => {
          setResult(res);
          setConfirmText("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "전력 요금 산출에 실패했습니다.");
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
        <div className="bg-surface rounded-[32px] w-full max-w-md p-10 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-success-bg text-success-fg rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">전력 요금 산출 완료</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {result.year}년 {result.month}월
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-surface-2 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">대상</p>
              <p className="text-2xl font-black font-mono mt-1">{result.totalCount}</p>
            </div>
            <div className="bg-success-bg rounded-2xl p-4">
              <p className="text-[10px] font-bold text-success-fg uppercase tracking-widest">성공</p>
              <p className="text-2xl font-black font-mono mt-1 text-success-fg">{result.successCount}</p>
            </div>
            <div className="bg-warning-bg rounded-2xl p-4">
              <p className="text-[10px] font-bold text-warning-fg uppercase tracking-widest">스킵</p>
              <p className="text-2xl font-black font-mono mt-1 text-warning-fg">{result.skipCount}</p>
            </div>
          </div>
          <div className="bg-foreground text-white rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">총 요금</p>
            <p className="text-3xl font-black font-mono mt-1">₩{formatKrw(result.totalFee)}</p>
          </div>
          <Button onClick={handleClose} className="w-full h-12 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90">
            닫기
          </Button>
        </div>
      </div>
    );
  }

  // 확인 모달 단계 ② (① 멱등성 라벨 포함)
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-surface rounded-[32px] w-full max-w-md p-10 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-error-bg text-error-fg rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">전력 요금 산출 (위험 액션)</h2>
            <p className="text-[11px] text-error-fg font-bold flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3" />
              기존 월 요금 내역을 덮어씁니다 (멱등 X)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">연도</Label>
            <Input type="number" min={2020} max={2099} value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-12 rounded-2xl font-mono border-border bg-surface-2 px-5" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">월</Label>
            <Input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} className="h-12 rounded-2xl font-mono border-border bg-surface-2 px-5" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">단가 (원/kWh)</Label>
            <Input type="number" min={1} value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="h-12 rounded-2xl font-mono border-border bg-surface-2 px-5" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground">기본료 (원)</Label>
            <Input type="number" min={0} value={baseFee} onChange={(e) => setBaseFee(Number(e.target.value))} className="h-12 rounded-2xl font-mono border-border bg-surface-2 px-5" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground">실행하려면 아래에 `RUN` 을 입력하세요</Label>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="h-12 rounded-2xl font-mono border-border bg-surface-2 px-5" placeholder="RUN" />
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={calculateMutation.isPending} className="flex-1 h-12 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-surface-2">
            취소
          </Button>
          <Button
            onClick={handleRun}
            disabled={calculateMutation.isPending || confirmText !== "RUN"}
            className="flex-1 h-12 rounded-2xl font-bold bg-error text-white hover:bg-error/90 disabled:bg-error/40"
          >
            {calculateMutation.isPending ? "실행 중..." : "산출 실행"}
          </Button>
        </div>
      </div>
    </div>
  );
}
