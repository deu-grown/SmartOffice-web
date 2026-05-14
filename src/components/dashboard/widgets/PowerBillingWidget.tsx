import { Zap } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import { usePowerBilling } from "@/src/features/power/hooks";
import type { PowerBillingQuery } from "@/src/features/power/types";

interface PowerBillingWidgetProps {
  query?: PowerBillingQuery;
}

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

function PowerBillingWidgetInner({ query }: PowerBillingWidgetProps) {
  const { data, isLoading, isError, error } = usePowerBilling(query);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }

  if (isError) {
    return <WidgetErrorFallback message={error?.message ?? "월 요금 데이터를 불러오지 못했습니다."} />;
  }

  const periodLabel =
    data?.year && data?.month ? `${data.year}년 ${data.month}월` : "현재 월";

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-400 text-sm font-medium">월 요금</p>
        <Zap className="w-4 h-4 text-gray-300" />
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold text-black">
          ₩{((data?.totalFee ?? 0) / 10000).toLocaleString(undefined, {
            maximumFractionDigits: 1,
          })}만
        </span>
      </div>
      <p className="text-gray-500 text-xs">
        {periodLabel} · 누적 {(data?.totalKwh ?? 0).toLocaleString()} kWh
      </p>
    </div>
  );
}

export function PowerBillingWidget(props: PowerBillingWidgetProps) {
  return (
    <ErrorBoundary fallback={<WidgetErrorFallback message="요금 위젯 렌더 오류" />}>
      <PowerBillingWidgetInner {...props} />
    </ErrorBoundary>
  );
}
