import { useState } from "react";
import { Zap } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import { POWER_ZONES_TEMP } from "@/src/features/power/constants";
import { usePowerCurrent } from "@/src/features/power/hooks";

// 위젯 단위 fallback. 렌더링 에러 시 KPI/타 위젯 영향 없이 본 위젯만 대체.
function WidgetErrorFallback({ message }: { message: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm">
      <div className="flex items-center gap-3 text-red-500">
        <Zap className="w-5 h-5" />
        <p className="text-sm font-bold">{message}</p>
      </div>
    </div>
  );
}

function PowerCurrentWidgetInner() {
  // 자체 zone 셀렉터. 환경 모니터링 셀렉터와 결합하면 환경 센서 미보유 zone(회의실 A·B)
  // 전력을 표시할 수 없는 결함이 있어 분리한다.
  const [selectedZoneId, setSelectedZoneId] = useState<number>(POWER_ZONES_TEMP[0].zoneId);
  const { data, isLoading, isError, error } = usePowerCurrent(selectedZoneId);

  const totalWatt =
    data?.devices.reduce((acc, d) => acc + (d.avgWatt ?? 0), 0) ?? 0;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-400 text-sm font-medium">실시간 전력</p>
        <div className="flex items-center gap-2">
          <Select
            value={String(selectedZoneId)}
            onValueChange={(v) => setSelectedZoneId(Number(v))}
          >
            <SelectTrigger className="w-[120px] h-8 bg-gray-50 border-gray-100 rounded-xl text-[11px] font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100">
              {POWER_ZONES_TEMP.map((z) => (
                <SelectItem key={z.zoneId} value={String(z.zoneId)}>
                  {z.zoneName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Zap className="w-4 h-4 text-gray-300" />
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-full" />
        </div>
      ) : isError ? (
        <WidgetErrorFallback
          message={error?.message ?? "전력 데이터를 불러오지 못했습니다."}
        />
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-black">
              {totalWatt.toLocaleString()}
            </span>
            <span className="text-gray-400 text-xs font-medium">W</span>
          </div>
          <p className="text-gray-500 text-xs">
            {data?.zoneName ?? "-"} · 장치 {data?.devices.length ?? 0}대
          </p>
        </>
      )}
    </div>
  );
}

// ErrorBoundary 로 감싸 KPI/타 위젯과 격리한다 (마스터플랜 G2 1순위 항목).
export function PowerCurrentWidget() {
  return (
    <ErrorBoundary fallback={<WidgetErrorFallback message="전력 위젯 렌더 오류" />}>
      <PowerCurrentWidgetInner />
    </ErrorBoundary>
  );
}
