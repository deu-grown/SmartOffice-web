// 주차장 구역별 요약 카드 (총/점유/여유/비활성). spot 상세 리스트는 SpotsTable 이 담당하므로 본 컴포넌트는 stat 카드 역할에 집중.
// useParkingZoneSummary(zoneId) hook 연결. zoneId 미지정 시 안내 텍스트.
import { Car, Activity, ParkingMeter, ParkingCircle } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import { useParkingZoneSummary } from "@/src/features/parking/hooks";

interface Props {
  zoneId: number | undefined;
}

export function ParkingZoneSummary({ zoneId }: Props) {
  const summaryQuery = useParkingZoneSummary(zoneId);

  if (zoneId === undefined) {
    return (
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)] text-center text-sm text-muted-foreground">
        구역을 선택하면 점유 요약이 표시됩니다.
      </div>
    );
  }

  if (summaryQuery.isLoading) {
    return (
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)] text-center text-sm text-muted-foreground">
        구역 요약 불러오는 중...
      </div>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)] text-center text-sm text-error-fg">
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
      color: "text-foreground",
      bg: "bg-surface",
    },
    {
      label: "점유",
      value: occupiedSpots,
      icon: Car,
      color: "text-success-fg",
      bg: "bg-success-bg/40 border-success-bg",
    },
    {
      label: "여유",
      value: availableSpots,
      icon: ParkingMeter,
      color: "text-primary",
      bg: "bg-surface",
    },
    {
      label: "비활성",
      value: inactiveSpots,
      icon: Activity,
      color: "text-muted-foreground",
      bg: "bg-surface",
    },
  ];

  return (
    <div className="bg-surface p-8 rounded-2xl border border-border shadow-[var(--shadow-card)] space-y-8">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-black text-foreground">{zoneName} 요약</h3>
        <span className="text-xs font-bold text-muted-foreground">전체 {totalSpots}면</span>
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
                "p-6 rounded-2xl border border-border shadow-[var(--shadow-card)] flex flex-col justify-between h-32",
                card.bg,
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center", card.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground block">
                  {card.label}
                </span>
                <span className={cn("text-2xl font-black tracking-tighter tabular-nums", card.color)}>{card.value}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
