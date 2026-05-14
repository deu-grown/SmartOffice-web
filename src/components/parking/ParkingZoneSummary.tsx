// 주차장 구역별 요약 카드 (총/점유/여유) + spot 리스트.
// useParkingZoneSummary(zoneId) hook 연결. zoneId 미지정 시 안내 텍스트.
import { Car, Activity, ParkingMeter, ParkingCircle } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import { useParkingZoneSummary } from "@/src/features/parking/hooks";

const SPOT_TYPE_LABEL: Record<string, string> = {
  REGULAR: "일반",
  DISABLED: "장애인",
  EV: "EV 충전",
};

interface Props {
  zoneId: number | undefined;
}

export function ParkingZoneSummary({ zoneId }: Props) {
  const summaryQuery = useParkingZoneSummary(zoneId);

  if (zoneId === undefined) {
    return (
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm text-center text-sm text-gray-400">
        구역을 선택하면 점유 요약과 주차면 리스트가 표시됩니다.
      </div>
    );
  }

  if (summaryQuery.isLoading) {
    return (
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm text-center text-sm text-gray-400">
        구역 요약 불러오는 중...
      </div>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm text-center text-sm text-red-500">
        구역 요약 조회 중 오류가 발생했습니다.
      </div>
    );
  }

  const { zoneName, totalSpots, occupiedSpots, availableSpots, spots } = summaryQuery.data;
  const inactiveSpots = spots.filter((s) => s.spotStatus === "INACTIVE").length;

  const cards = [
    {
      label: "총 주차면",
      value: totalSpots,
      icon: ParkingCircle,
      color: "text-zinc-700",
      bg: "bg-white",
    },
    {
      label: "점유",
      value: occupiedSpots,
      icon: Car,
      color: "text-emerald-600",
      bg: "bg-emerald-50/40 border-emerald-100",
    },
    {
      label: "여유",
      value: availableSpots,
      icon: ParkingMeter,
      color: "text-indigo-600",
      bg: "bg-white",
    },
    {
      label: "비활성",
      value: inactiveSpots,
      icon: Activity,
      color: "text-gray-400",
      bg: "bg-white",
    },
  ];

  return (
    <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm space-y-8">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-black">{zoneName} 요약</h3>
        <span className="text-xs font-bold text-gray-400">전체 {totalSpots}면</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col justify-between h-32",
                card.bg,
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center", card.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">
                  {card.label}
                </span>
                <span className={cn("text-2xl font-black tracking-tighter", card.color)}>{card.value}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {spots.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
            주차면 리스트
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {spots.map((s) => (
              <div
                key={s.spotId}
                className={cn(
                  "p-3 rounded-2xl border flex items-center justify-between text-xs font-bold",
                  s.spotStatus === "INACTIVE"
                    ? "bg-gray-50 border-gray-200 text-gray-400"
                    : s.occupied
                      ? "bg-emerald-50/40 border-emerald-100 text-emerald-700"
                      : "bg-white border-gray-100 text-gray-700",
                )}
              >
                <span className="font-mono">{s.spotNumber}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400">
                  {SPOT_TYPE_LABEL[s.spotType] ?? s.spotType}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
