// 센서 차트 — 구역별 최신 센서 데이터 카드 + 이력 차트 (묶음 4 커밋 4.1).
// 환경 센서 (TEMPERATURE/HUMIDITY/CO2 등) 표시.
import { useMemo, useState } from "react";
import { Thermometer, Droplets, Wind, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/src/components/common/ErrorBoundary";
import { useSensorHistory, useSensorLatest } from "@/src/features/sensor/hooks";

interface SensorChartProps {
  zoneId: number | undefined;
  startDate?: string;
  endDate?: string;
}

function pickIcon(sensorType: string) {
  const t = sensorType.toUpperCase();
  if (t.includes("TEMP")) return Thermometer;
  if (t.includes("HUMI")) return Droplets;
  if (t.includes("CO2") || t.includes("AIR")) return Wind;
  return Activity;
}

function toNumber(v: number | string): number {
  return typeof v === "string" ? Number(v) : v;
}

function SensorChartInner({ zoneId, startDate, endDate }: SensorChartProps) {
  const latest = useSensorLatest(zoneId);

  // 날짜 기본값은 mount 시 1회만 계산 (impure Date 호출을 render 본문에서 분리).
  const [defaults] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const aWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return { today, aWeekAgo };
  });
  const effectiveStart = startDate ?? defaults.aWeekAgo;
  const effectiveEnd = endDate ?? defaults.today;

  const history = useSensorHistory(zoneId, effectiveStart, effectiveEnd);

  const latestCards = useMemo(() => latest.data?.sensorDataList ?? [], [latest.data]);
  const historyCount = history.data?.totalCount ?? 0;

  if (zoneId === undefined) {
    return (
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-[var(--shadow-card)]">
        <p className="text-sm text-muted-foreground">zone 을 선택해 주세요.</p>
      </div>
    );
  }

  if (latest.isLoading) {
    return (
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-[var(--shadow-card)] space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (latest.isError) {
    return (
      <div className="bg-surface p-6 rounded-2xl border border-error-bg shadow-[var(--shadow-card)]">
        <p className="text-sm text-error-fg font-bold">센서 데이터를 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-[var(--shadow-card)] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-muted-foreground" />
          환경 센서 (zone #{zoneId})
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em]">
          최신 {latestCards.length} · 이력 {historyCount}
        </span>
      </div>

      {latestCards.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">본 구역에 환경 센서 데이터가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {latestCards.map((s) => {
            const Icon = pickIcon(s.sensorType);
            return (
              <div key={s.id} className="bg-surface-2 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{s.sensorType}</span>
                </div>
                <p className="text-2xl font-black font-mono">
                  {toNumber(s.value).toFixed(1)}
                  <span className="text-xs text-muted-foreground font-medium ml-1">{s.unit}</span>
                </p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{s.timestamp}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SensorChart(props: SensorChartProps) {
  return (
    <ErrorBoundary fallback={<div className="bg-surface p-6 rounded-2xl border border-error-bg shadow-[var(--shadow-card)]"><p className="text-sm text-error-fg font-bold">센서 차트 렌더 오류</p></div>}>
      <SensorChartInner {...props} />
    </ErrorBoundary>
  );
}
