// 구역별 시간별 전력 차트 — 묶음 4 커밋 4.3.
// usePowerHourly(zoneId, range) 연결. recharts AreaChart.
import { useMemo, useState } from "react";
import { Activity, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import {
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { usePowerHourly } from "@/src/features/power/hooks";

interface PowerHourlyChartProps {
  zoneId: number | undefined;
}

function toNumber(v: number | string): number {
  return typeof v === "string" ? Number(v) : v;
}

function PowerHourlyChartInner({ zoneId }: PowerHourlyChartProps) {
  // 기본 범위: 최근 7일.
  const [defaults] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return { startDate: start, endDate: today };
  });

  const hourly = usePowerHourly(zoneId, defaults);
  const chartData = useMemo(
    () =>
      (hourly.data?.logs ?? []).map((l) => ({
        hour: l.hourAt.slice(11, 16),
        kwh: toNumber(l.kwh),
        avgWatt: toNumber(l.avgWatt),
      })),
    [hourly.data]
  );

  if (zoneId === undefined) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-400">zone 을 선택해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          시간별 전력 사용량 (zone #{zoneId})
        </h3>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {defaults.startDate} ~ {defaults.endDate}
        </span>
      </div>

      {hourly.isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : hourly.isError ? (
        <div className="h-64 flex items-center justify-center text-red-500 text-sm font-bold">
          전력 이력을 불러오지 못했습니다.
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
          <Activity className="w-8 h-8" />
          <p>이력 데이터가 없습니다.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="powerArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8E8FFA" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8E8FFA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <RechartsTooltip />
            <Area type="monotone" dataKey="kwh" stroke="#8E8FFA" fill="url(#powerArea)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function PowerHourlyChart(props: PowerHourlyChartProps) {
  return (
    <ErrorBoundary fallback={<div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm"><p className="text-sm text-red-500 font-bold">전력 차트 렌더 오류</p></div>}>
      <PowerHourlyChartInner {...props} />
    </ErrorBoundary>
  );
}
