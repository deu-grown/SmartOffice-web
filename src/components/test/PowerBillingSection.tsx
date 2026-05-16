// 섹션5 전력 요금 산출 — year·month·unitPrice·baseFee·zoneIds, 랜덤 자동 생성.
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePowerBillingInjection } from "@/src/features/testInjection/hooks";
import { nowLocalDateTime } from "@/src/features/testInjection/seedData";
import type { InjectionLogEntry } from "@/src/features/testInjection/types";
import { ApiError } from "@/src/lib/api/types";

interface Props {
  onLog: (entry: InjectionLogEntry) => void;
}

interface LastResult {
  success: boolean;
  text: string;
}

export function PowerBillingSection({ onLog }: Props) {
  const mutation = usePowerBillingInjection();
  const now = new Date();
  const [year, setYear] = useState<string>(String(now.getFullYear()));
  const [month, setMonth] = useState<string>(String(now.getMonth() + 1));
  const [unitPrice, setUnitPrice] = useState<string>("120");
  const [baseFee, setBaseFee] = useState<string>("1000");
  const [zoneIdsRaw, setZoneIdsRaw] = useState<string>("");
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  const fillRandom = () => {
    setYear(String(now.getFullYear()));
    setMonth(String(now.getMonth() + 1));
    setUnitPrice(String(Math.floor(80 + Math.random() * 100)));
    setBaseFee(String(Math.floor(500 + Math.random() * 1500)));
    setZoneIdsRaw("");
  };

  const handleRun = () => {
    const y = Number(year), m = Number(month), u = Number(unitPrice), b = Number(baseFee);
    if (!y || !m || !u || b < 0) { toast.error("필수 필드를 모두 입력하세요."); return; }
    const zoneIds = zoneIdsRaw
      ? zoneIdsRaw.split(",").map((s) => Number(s.trim())).filter((n) => n > 0)
      : undefined;
    const at = nowLocalDateTime();
    mutation.mutate(
      { year: y, month: m, unitPrice: u, baseFee: b, zoneIds },
      {
        onSuccess: (data) => {
          const text = `${y}년 ${m}월 요금 산출 완료 — ${JSON.stringify(data).slice(0, 80)}`;
          setLastResult({ success: true, text });
          toast.success("전력 요금 산출 완료");
          onLog({ id: crypto.randomUUID(), at, domain: "전력 요금", summary: text, success: true });
        },
        onError: (err) => {
          const msg = (err instanceof ApiError ? err.serverMessage : null) ?? "산출 실패";
          setLastResult({ success: false, text: msg });
          toast.error(msg);
          onLog({ id: crypto.randomUUID(), at, domain: "전력 요금", summary: msg, success: false });
        },
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-gray-800">섹션5 — 전력 요금 산출</h3>
      <p className="text-xs text-gray-400">선행: 섹션2에서 POWER 센서 주입 완료 후 실행하세요.</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">연도</Label>
          <Input value={year} onChange={(e) => setYear(e.target.value)} type="number" min="2020" className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">월</Label>
          <Input value={month} onChange={(e) => setMonth(e.target.value)} type="number" min="1" max="12" className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">전력 단가 (원/kWh)</Label>
          <Input value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} type="number" min="1" className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">기본 요금 (원)</Label>
          <Input value={baseFee} onChange={(e) => setBaseFee(e.target.value)} type="number" min="0" className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">대상 zoneId (선택 — 쉼표 구분, 비우면 전체)</Label>
        <Input
          value={zoneIdsRaw}
          onChange={(e) => setZoneIdsRaw(e.target.value)}
          placeholder="예: 2,4,5,7"
          className="h-9 text-xs rounded-xl bg-gray-50 border-gray-100"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleRun}
          disabled={mutation.isPending}
          className="bg-black text-white hover:bg-black/90 rounded-xl h-9 text-xs"
        >
          {mutation.isPending ? "산출 중..." : "요금 산출"}
        </Button>
        <Button
          variant="outline"
          onClick={fillRandom}
          className="rounded-xl h-9 text-xs border-gray-200"
        >
          랜덤 자동 생성
        </Button>
      </div>

      {lastResult && (
        <div
          className={cn(
            "rounded-xl p-3 text-xs font-medium",
            lastResult.success
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-600",
          )}
        >
          {lastResult.text}
        </div>
      )}
    </div>
  );
}
