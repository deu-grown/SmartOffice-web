import { Zap } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import { usePowerCurrent } from "@/src/features/power/hooks";

interface PowerCurrentWidgetProps {
  zoneId: number | undefined;
}

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

function PowerCurrentWidgetInner({ zoneId }: PowerCurrentWidgetProps) {
  const { data, isLoading, isError, error } = usePowerCurrent(zoneId);

  if (zoneId === undefined) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p className="text-gray-400 text-sm font-medium mb-1">실시간 전력</p>
        <p className="text-gray-300 text-xs">구역을 선택해 주세요.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }

  if (isError) {
    return <WidgetErrorFallback message={error?.message ?? "전력 데이터를 불러오지 못했습니다."} />;
  }

  const totalWatt =
    data?.devices.reduce((acc, d) => acc + (d.avgWatt ?? 0), 0) ?? 0;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-400 text-sm font-medium">실시간 전력</p>
        <Zap className="w-4 h-4 text-gray-300" />
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold text-black">{totalWatt.toLocaleString()}</span>
        <span className="text-gray-400 text-xs font-medium">W</span>
      </div>
      <p className="text-gray-500 text-xs">
        {data?.zoneName ?? "-"} · 장치 {data?.devices.length ?? 0}대
      </p>
    </div>
  );
}

// ErrorBoundary 로 감싸 KPI/타 위젯과 격리한다 (마스터플랜 G2 1순위 항목).
export function PowerCurrentWidget(props: PowerCurrentWidgetProps) {
  return (
    <ErrorBoundary fallback={<WidgetErrorFallback message="전력 위젯 렌더 오류" />}>
      <PowerCurrentWidgetInner {...props} />
    </ErrorBoundary>
  );
}
