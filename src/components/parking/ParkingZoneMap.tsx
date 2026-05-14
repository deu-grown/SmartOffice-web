// 주차장 평면도 (zoneId 기준 spot 좌표/점유 시각화).
// 묶음 3 (분할) 시점: mock 24-spot 평면도 자체 보유. ParkingManagement 컨테이너 평면도 영역을 그대로 이동.
// 묶음 4 흡수 시점에 props zoneId + useParkingZoneMap(zoneId) hook 으로 swap, ParkingZoneMapResponse 좌표 기반 렌더 + grid fallback.
import { useState } from "react";
import { Car, Info } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const TOTAL_SPOTS = 24;

interface Spot {
  id: number;
  isOccupied: boolean;
}

// mock spot 배열 — 묶음 4 에서 useParkingZoneMap(zoneId) 응답으로 swap 예정.
const initialSpots: Spot[] = Array.from({ length: TOTAL_SPOTS }, (_, i) => ({
  id: i + 1,
  isOccupied: Math.random() > 0.4,
}));

export function ParkingZoneMap() {
  const [spots] = useState<Spot[]>(initialSpots);

  return (
    <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
            <Car className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">주차 구역 모니터링</h3>
          </div>
        </div>
        <div className="flex gap-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded-sm" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">빈자리</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-black rounded-sm" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">사용중</span>
          </div>
        </div>
      </div>

      <div className="p-1 w-full bg-gray-50/50 rounded-[40px] border border-gray-100/50 overflow-hidden">
        <div className="p-8 md:p-12 overflow-x-auto">
          <div className="inline-grid grid-cols-8 gap-4 min-w-[800px] w-full">
            {spots.map((spot) => (
              <motion.div
                key={spot.id}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "aspect-[3/4] rounded-2xl flex flex-col items-center justify-center shadow-sm border-2 transition-all cursor-crosshair",
                  spot.isOccupied
                    ? "bg-black border-black/5"
                    : "bg-white border-white hover:border-indigo-100",
                )}
              >
                <span
                  className={cn(
                    "text-lg font-bold font-mono mb-1",
                    spot.isOccupied ? "text-white/30" : "text-gray-400",
                  )}
                >
                  {String(spot.id).padStart(2, "0")}
                </span>
                {spot.isOccupied ? (
                  <Car className="w-6 h-6 text-indigo-500 fill-indigo-500/20" />
                ) : (
                  <div className="w-1 h-8 bg-gray-100/50 rounded-full" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-6 bg-indigo-50/30 rounded-[30px] border border-indigo-100/30 group">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
          <Info className="w-5 h-5 text-indigo-500" />
        </div>
        <p className="text-xs text-indigo-900/60 font-medium leading-relaxed">
          현재 주차 게이트 제어 시스템이 정상 작동 중입니다. 센서 데이터는{" "}
          <span className="text-indigo-600 font-bold">5초마다</span> 동기화됩니다.
        </p>
      </div>
    </div>
  );
}
