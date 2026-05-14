import React, { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Thermometer,
  Droplets,
  Wind,
  DoorOpen,
  Zap,
  Monitor,
} from "lucide-react";
import { motion } from "motion/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  useDashboardAttendanceToday,
  useDashboardRecentAccess,
  useDashboardSensorsCurrent,
  useDashboardSummary,
} from "@/src/features/dashboard/hooks";
import type {
  AttendanceToday,
  RecentAccess,
  SensorCurrent,
} from "@/src/features/dashboard/types";
import { PowerBillingWidget } from "@/src/components/dashboard/widgets/PowerBillingWidget";
import { PowerCurrentWidget } from "@/src/components/dashboard/widgets/PowerCurrentWidget";
import type { TabType } from "@/src/types";

interface IntegratedDashboardProps {
  onTabChange: (tab: TabType) => void;
}

export function IntegratedDashboard({ onTabChange }: IntegratedDashboardProps) {
  const summaryQuery = useDashboardSummary();
  const sensorsQuery = useDashboardSensorsCurrent();
  const attendanceQuery = useDashboardAttendanceToday();
  const recentAccessQuery = useDashboardRecentAccess({ limit: 5 });

  const sensors: SensorCurrent[] = sensorsQuery.data ?? [];
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(undefined);

  // 센서 응답이 처음 도착하면 첫 구역을 기본 선택.
  React.useEffect(() => {
    if (sensors.length > 0 && selectedZoneId === undefined) {
      setSelectedZoneId(sensors[0].zoneId);
    }
  }, [sensors, selectedZoneId]);

  const currentSensor = sensors.find((s) => s.zoneId === selectedZoneId);

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">
          통합 관제 대시보드
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          스마트 오피스의 실시간 현황을 모니터링합니다
        </p>
      </header>

      <KpiSection
        summary={summaryQuery.data}
        attendance={attendanceQuery.data}
        isLoading={summaryQuery.isLoading || attendanceQuery.isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EnvironmentCard
          sensors={sensors}
          isLoading={sensorsQuery.isLoading}
          isError={sensorsQuery.isError}
          selectedZoneId={selectedZoneId}
          onSelectZone={setSelectedZoneId}
          currentSensor={currentSensor}
        />
        <PowerCurrentWidget zoneId={selectedZoneId} />
        <PowerBillingWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttendancePieCard attendance={attendanceQuery.data} isLoading={attendanceQuery.isLoading} />
        <RecentAccessList
          items={recentAccessQuery.data ?? []}
          isLoading={recentAccessQuery.isLoading}
          onViewAll={() => onTabChange("출입 기록 관리")}
        />
      </div>
    </div>
  );
}

// ── 섹션 컴포넌트 ────────────────────────────────────────────────────

interface KpiSectionProps {
  summary: { totalUsers: number; todayReservations: number; activeDevices: number; pendingApprovals: number } | undefined;
  attendance: AttendanceToday | undefined;
  isLoading: boolean;
}

function KpiSection({ summary, attendance, isLoading }: KpiSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-[32px]" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        icon={Users}
        label="현재 출근 인원"
        value={attendance?.presentCount?.toLocaleString() ?? "0"}
        subValue={`/ ${attendance?.totalExpected ?? 0}`}
        trend={attendance && attendance.lateCount > 0 ? `지각 ${attendance.lateCount}` : null}
      />
      <StatCard
        icon={DoorOpen}
        label="오늘의 예약"
        value={summary?.todayReservations?.toLocaleString() ?? "0"}
        trend={summary && summary.pendingApprovals > 0 ? `${summary.pendingApprovals}건 대기` : null}
      />
      <StatCard
        icon={Zap}
        label="활성 장치"
        value={summary?.activeDevices?.toLocaleString() ?? "0"}
      />
      <StatCard
        icon={Monitor}
        label="전체 사용자"
        value={summary?.totalUsers?.toLocaleString() ?? "0"}
      />
    </div>
  );
}

interface EnvironmentCardProps {
  sensors: SensorCurrent[];
  isLoading: boolean;
  isError: boolean;
  selectedZoneId: number | undefined;
  onSelectZone: (zoneId: number) => void;
  currentSensor: SensorCurrent | undefined;
}

function EnvironmentCard({
  sensors,
  isLoading,
  isError,
  selectedZoneId,
  onSelectZone,
  currentSensor,
}: EnvironmentCardProps) {
  if (isError) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-red-100 shadow-sm">
        <p className="text-sm font-bold text-red-500">환경 센서 데이터를 불러오지 못했습니다.</p>
      </div>
    );
  }
  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">환경 모니터링</h3>
        <Select
          value={selectedZoneId !== undefined ? String(selectedZoneId) : undefined}
          onValueChange={(v) => onSelectZone(Number(v))}
        >
          <SelectTrigger className="w-[140px] h-9 bg-gray-50 border-gray-100 rounded-xl text-xs font-bold">
            <SelectValue placeholder="구역 선택" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-100">
            {sensors.map((s) => (
              <SelectItem key={s.zoneId} value={String(s.zoneId)}>
                {s.zoneName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : currentSensor ? (
        <div className="space-y-6">
          <EnvItem
            icon={Thermometer}
            label="온도"
            value={currentSensor.temp}
            unit="°C"
            status={getEnvStatus(currentSensor.temp, "temp")}
            color="text-orange-500"
            bg="bg-orange-50"
          />
          <EnvItem
            icon={Droplets}
            label="습도"
            value={currentSensor.humi}
            unit="%"
            status={getEnvStatus(currentSensor.humi, "humi")}
            color="text-blue-500"
            bg="bg-blue-50"
          />
          <EnvItem
            icon={Wind}
            label="CO2 농도"
            value={currentSensor.co2}
            unit="ppm"
            status={getEnvStatus(currentSensor.co2, "co2")}
            color="text-green-500"
            bg="bg-green-50"
          />
        </div>
      ) : (
        <p className="text-center text-gray-400 py-12">표시할 센서 데이터가 없습니다.</p>
      )}
      <div className="pt-4 border-t border-gray-50">
        <p className="text-xs text-gray-400 leading-relaxed">
          * 센서 데이터 업데이트:{" "}
          {currentSensor?.updatedAt
            ? new Date(currentSensor.updatedAt).toLocaleTimeString()
            : "-"}
        </p>
      </div>
    </div>
  );
}

function AttendancePieCard({
  attendance,
  isLoading,
}: {
  attendance: AttendanceToday | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-[360px] rounded-[32px]" />;
  }
  const present = attendance?.presentCount ?? 0;
  const absent = attendance?.absentCount ?? 0;
  const total = attendance?.totalExpected ?? 0;
  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
      <h3 className="text-xl font-bold text-gray-900 mb-4 w-full text-left">근태 현황</h3>
      <div className="h-[200px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: "출근", value: present },
                { name: "미출근", value: absent },
              ]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              <Cell fill="#000000" />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-2xl font-bold text-gray-900">
            {present}/{total}
          </span>
          <p className="text-[10px] text-gray-400 font-bold uppercase">출근율</p>
        </div>
      </div>
      <div className="w-full space-y-3 mt-4">
        <LegendRow color="bg-black" label="출근" value={present} />
        <LegendRow color="bg-gray-200" label="결근" value={absent} />
      </div>
    </div>
  );
}

function RecentAccessList({
  items,
  isLoading,
  onViewAll,
}: {
  items: RecentAccess[];
  isLoading: boolean;
  onViewAll: () => void;
}) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">최근 출입 기록</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-gray-400 hover:text-black transition-colors"
        >
          전체보기
        </button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 py-12">최근 출입 기록이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">
                  👤
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{log.userName}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{log.zoneName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-900">
                  {new Date(log.accessTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    log.type === "IN"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600",
                  )}
                >
                  {log.type === "IN" ? "입장" : "퇴장"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 헬퍼 ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
  trend?: string | null;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between h-40"
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-black" />
        </div>
        {trend && (
          <div className="px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {subValue && (
            <span className="text-sm font-medium text-gray-400">{subValue}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EnvItem({
  icon: Icon,
  label,
  value,
  unit,
  status,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  // 백엔드가 해당 구역의 센서 미존재 시 null 을 내려보내므로 null 허용.
  value: number | null;
  unit: string;
  status: string | null;
  color: string;
  bg: string;
}) {
  const hasValue = value !== null && Number.isFinite(value);
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", bg)}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">{hasValue ? value : "-"}</span>
            {hasValue && <span className="text-xs font-medium text-gray-400">{unit}</span>}
          </div>
        </div>
      </div>
      {status ? (
        <span
          className={cn(
            "inline-flex items-center justify-center border-none px-3 py-1 rounded-full text-[10px] font-bold",
            bg,
            color,
          )}
        >
          {status}
        </span>
      ) : (
        <span className="text-xs text-gray-300 font-medium">측정 없음</span>
      )}
    </div>
  );
}

function LegendRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{value}명</span>
    </div>
  );
}

function getEnvStatus(val: number | null, type: "temp" | "humi" | "co2"): string | null {
  // 센서 데이터가 없는 zone 의 필드는 null 로 내려오므로 라벨을 표시하지 않는다.
  if (val === null || !Number.isFinite(val)) return null;
  if (type === "temp") return val > 26 ? "더움" : val < 20 ? "추움" : "쾌적";
  if (type === "humi") return val > 60 ? "습함" : val < 30 ? "건조" : "적정";
  if (type === "co2") return val > 1000 ? "나쁨" : val > 700 ? "보통" : "좋음";
  return null;
}
