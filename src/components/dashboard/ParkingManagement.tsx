// 주차 관리 페이지 (G9). 묶음 6a: vehicle + parking-reservation UI 신설.
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ParkingCircle,
  Car,
  ParkingMeter,
  Activity,
  CalendarClock,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { ZoneSelect } from "@/src/components/common/ZoneSelect";
import { ParkingSpotsTable } from "@/src/components/parking/ParkingSpotsTable";
import { ParkingZoneSummary } from "@/src/components/parking/ParkingZoneSummary";
import { ParkingZoneMap } from "@/src/components/parking/ParkingZoneMap";
import { VehicleSection } from "@/src/components/parking/VehicleSection";
import { ReservationSection } from "@/src/components/parking/ReservationSection";
import { useParkingReservations, useParkingSpots, useParkingZoneSummary, useParkingZones } from "@/src/features/parking/hooks";
import { useVehicles } from "@/src/features/vehicle/hooks";

export function ParkingManagement() {
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(undefined);

  const { data: parkingZones } = useParkingZones();

  // Spot 통계 — zoneId 선택 시 zoneSummary, 아니면 전체 spots 집계.
  const allSpotsQuery = useParkingSpots(selectedZoneId === undefined ? {} : { zoneId: selectedZoneId });
  const zoneSummaryQuery = useParkingZoneSummary(selectedZoneId);

  // 차량 · 예약 통계 (전체 기준).
  const vehiclesQuery = useVehicles({});
  const reservedQuery = useParkingReservations({ status: "RESERVED" });
  const parkedQuery = useParkingReservations({ status: "PARKED" });

  // 주차면 보유 구역 목록 (GET /parking/zones).
  const zoneOptions = useMemo(
    () => (parkingZones ?? []).map((z) => ({ id: z.zoneId, name: z.zoneName, suffix: `(${z.zoneType})` })),
    [parkingZones]
  );

  const stats = useMemo(() => {
    if (selectedZoneId !== undefined && zoneSummaryQuery.data) {
      const total = zoneSummaryQuery.data.totalSpots;
      const occupied = zoneSummaryQuery.data.occupiedSpots;
      const available = zoneSummaryQuery.data.availableSpots;
      const inactive = zoneSummaryQuery.data.spots.filter((s) => s.spotStatus === "INACTIVE").length;
      return { total, occupied, available, inactive };
    }
    const spots = allSpotsQuery.data ?? [];
    const total = spots.length;
    const occupied = spots.filter((s) => s.occupied).length;
    const inactive = spots.filter((s) => s.spotStatus === "INACTIVE").length;
    return { total, occupied, available: total - occupied, inactive };
  }, [selectedZoneId, zoneSummaryQuery.data, allSpotsQuery.data]);

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-surface p-8 rounded-4xl border border-border shadow-card">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">주차 관리</h1>
          <p className="text-sm font-medium text-muted-foreground">
            구역별 주차면 CRUD · 평면도 · 실시간 점유 현황. 차량/예약 관리는 백엔드 미지원
            (BACKEND_SUGGESTIONS #14).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ZoneSelect
            options={zoneOptions}
            value={selectedZoneId}
            onChange={(id) => setSelectedZoneId(id)}
            placeholder="구역 선택"
            triggerClassName="h-12 w-[220px] bg-surface-2 border-none rounded-2xl px-5 font-bold"
          />
        </div>
      </header>

      {/* Stats 4종 (spot 통계 기반) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "총 주차면",
            value: stats.total,
            icon: ParkingCircle,
            color: "text-foreground",
            bg: "bg-surface",
          },
          {
            label: "점유",
            value: stats.occupied,
            icon: Car,
            color: "text-success-fg",
            bg: "bg-success-bg",
          },
          {
            label: "여유",
            value: stats.available,
            icon: ParkingMeter,
            color: "text-info-fg",
            bg: "bg-surface",
          },
          {
            label: "비활성",
            value: stats.inactive,
            icon: Activity,
            color: "text-muted-foreground",
            bg: "bg-surface",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "p-8 rounded-4xl border border-border shadow-card flex flex-col justify-between h-44",
                stat.bg,
              )}
            >
              <div className={cn("w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center", stat.color)}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black font-sans uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                  {stat.label}
                </span>
                <span className={cn("text-3xl font-black tracking-tighter", stat.color)}>
                  {stat.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 차량 통계 3종 */}
      <div className="grid grid-cols-3 gap-6">
        {[
          {
            label: "등록 차량",
            value: vehiclesQuery.data?.totalElements ?? 0,
            icon: Car,
            color: "text-info-fg",
            bg: "bg-surface",
          },
          {
            label: "입차 중",
            value: parkedQuery.data?.totalElements ?? 0,
            icon: ParkingCircle,
            color: "text-success-fg",
            bg: "bg-success-bg",
          },
          {
            label: "예약 대기",
            value: reservedQuery.data?.totalElements ?? 0,
            icon: CalendarClock,
            color: "text-warning-fg",
            bg: "bg-warning-bg",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 + 0.32 }}
              className={cn(
                "p-6 rounded-4xl border border-border shadow-card flex flex-col justify-between h-36",
                stat.bg,
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center", stat.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black font-sans uppercase tracking-[0.2em] text-muted-foreground block mb-1">{stat.label}</span>
                <span className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <ParkingZoneSummary zoneId={selectedZoneId} />
      <ParkingZoneMap zoneId={selectedZoneId} />
      <ParkingSpotsTable zoneId={selectedZoneId} />

      {/* 구분선 */}
      <div className="border-t border-border pt-2" />

      <VehicleSection />
      <ReservationSection zoneId={selectedZoneId} />
    </div>
  );
}
