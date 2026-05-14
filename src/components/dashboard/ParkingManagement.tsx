// 주차 관리 페이지 (G9). 플랜 3-3 묶음 4 흡수 — mock 차량 관리 일괄 제거, features/parking 으로 마이그레이션.
// 백엔드는 ParkingSpot CRUD + zone summary/map 만 보유 — 차량(Vehicle)/예약(Reservation) 모델 부재.
// 차량 관리는 BACKEND_SUGGESTIONS #14 (저~중) 채택 시점에 features 확장.
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ParkingCircle,
  Car,
  ParkingMeter,
  Activity,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { ZoneSelect } from "@/src/components/common/ZoneSelect";
import { ParkingSpotsTable } from "@/src/components/parking/ParkingSpotsTable";
import { ParkingZoneSummary } from "@/src/components/parking/ParkingZoneSummary";
import { ParkingZoneMap } from "@/src/components/parking/ParkingZoneMap";
import { useZones } from "@/src/features/zone/hooks";
import { useParkingSpots, useParkingZoneSummary } from "@/src/features/parking/hooks";

export function ParkingManagement() {
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(undefined);

  const zonesQuery = useZones();
  const zoneOptions = useMemo(
    () =>
      (zonesQuery.data ?? []).map((z) => ({
        id: z.id,
        name: z.name,
        suffix: `(${z.zoneType})`,
      })),
    [zonesQuery.data],
  );

  // Stat 카드용 통계. zoneId 선택 시 zoneSummary, 아니면 전체 spots 집계.
  const allSpotsQuery = useParkingSpots(selectedZoneId === undefined ? {} : { zoneId: selectedZoneId });
  const zoneSummaryQuery = useParkingZoneSummary(selectedZoneId);

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
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">주차 관리</h1>
          <p className="text-sm font-medium text-gray-500">
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
            triggerClassName="h-12 w-[220px] bg-gray-50 border-none rounded-2xl px-5 font-bold"
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
            color: "text-zinc-700",
            bg: "bg-white",
          },
          {
            label: "점유",
            value: stats.occupied,
            icon: Car,
            color: "text-emerald-600",
            bg: "bg-emerald-50/40 border-emerald-100",
          },
          {
            label: "여유",
            value: stats.available,
            icon: ParkingMeter,
            color: "text-indigo-600",
            bg: "bg-white",
          },
          {
            label: "비활성",
            value: stats.inactive,
            icon: Activity,
            color: "text-gray-400",
            bg: "bg-white",
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
                "p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between h-44",
                stat.bg,
              )}
            >
              <div className={cn("w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center", stat.color)}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black font-sans uppercase tracking-[0.2em] text-gray-400 block mb-1">
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

      <ParkingZoneSummary zoneId={selectedZoneId} />
      <ParkingZoneMap zoneId={selectedZoneId} />
      <ParkingSpotsTable zoneId={selectedZoneId} />
    </div>
  );
}
